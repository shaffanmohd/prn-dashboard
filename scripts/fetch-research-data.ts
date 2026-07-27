import duckdb from "duckdb";
import fs from "fs";
import path from "path";

interface Objective4Row {
  election: string;
  seat: string;
  votersTotal: number;
  pctChinese: number;
  pctMalay: number;
  pctIndian: number;
  marginPerc: number | null;
  winningCoalition: string;
}
interface Objective1Row {
  date: string;
  election: string;
  state: string;
  seat: string;
  coalition: string;
  voteShare: number | null;
  result: string;
  era: "pact" | "solo";
}

const db = new duckdb.Database(":memory:");
const con = db.connect();
function run<T>(sql: string): Promise<T[]> {
  return new Promise((resolve, reject) =>
    con.all(sql, (err: Error | null, rows: unknown) =>
      err ? reject(err) : resolve(rows as T[]),
    ),
  );
}

const LAKE = "https://lake.electiondata.my";

function toJson(data: unknown): string {
  return JSON.stringify(
    data,
    (_key, value) => (typeof value === "bigint" ? Number(value) : value),
    2,
  );
}

async function main() {
  const outDir = path.join(process.cwd(), "src/data/research");
  fs.mkdirSync(outDir, { recursive: true });

  // Objective 1 — every MUDA-contested seat, headline level
  const objective1 = await run<Objective1Row>(`
  SELECT
    b.date, b.election, b.state, b.seat, b.coalition,
    b.votes_perc AS voteShare, b.result,
    CASE
      -- GE15: Muar, Tanjung Piai, and the other PH-pact federal seats
      WHEN b.election = 'GE-15' THEN 'pact'

      -- Johor SE15: pact for all seats except Larkin, which PH genuinely
      -- contested against MUDA (confirmed via party-member knowledge + FMT
      -- reporting on the Puteri Wangsa pact — see chat history)
      WHEN b.election = 'SE-15' AND b.state = 'Johor' AND b.seat != 'N.44 Larkin' THEN 'pact'
      WHEN b.election = 'SE-15' AND b.state = 'Johor' AND b.seat = 'N.44 Larkin' THEN 'solo'

      -- Johor SE16 (2026): solo
      WHEN b.election = 'SE-16' THEN 'solo'

      -- 2023 four-state expansion: N9, Penang, Selangor, Terengganu — solo
      WHEN b.election = 'SE-15' AND b.state IN ('Negeri Sembilan', 'Pulau Pinang', 'Selangor', 'Terengganu') THEN 'solo'

      -- fallback: treat as solo unless explicitly classified pact above
      ELSE 'solo'
    END AS era
  FROM read_parquet('${LAKE}/results_headline/headline_ballots.parquet') b
  WHERE b.party_uid = '120-MUDA'
  ORDER BY b.date
`);
  fs.writeFileSync(`${outDir}/objective1.json`, toJson(objective1));
  console.log(`objective1.json — ${objective1.length} rows`);

  // Objective 2/3 — saluran-level youth + race buckets, pact vs solo
  // (same CTE structure we used in the Query Builder, now against lake files)
  const saluranDemo = await run(`
    WITH voter_agg AS (
      SELECT dm, pm, saluran, parlimen AS seat, 'Pact - GE15' AS era,
        COUNT(*) AS voters,
        COUNT(*) FILTER (WHERE (2022 - birth_year) BETWEEN 18 AND 30) * 100.0 / COUNT(*) AS pct_youth,
        COUNT(*) FILTER (WHERE ethnicity = 'Malay') * 100.0 / COUNT(*) AS pct_malay,
        COUNT(*) FILTER (WHERE ethnicity = 'Chinese') * 100.0 / COUNT(*) AS pct_chinese
      FROM read_parquet('${LAKE}/voter_rolls/ge15_2022.parquet')
      WHERE parlimen IN (
        SELECT seat FROM read_parquet('${LAKE}/results_headline/headline_ballots.parquet')
        WHERE party_uid = '120-MUDA' AND election = 'GE-15'
      ) AND dm NOT LIKE '%/UP%'
      GROUP BY dm, pm, saluran, parlimen

      UNION ALL

      SELECT dm, pm, saluran, dun AS seat,
        CASE WHEN dun = 'N.44 Larkin' THEN 'Solo - Larkin SE15' ELSE 'Pact - JHR SE15' END AS era,
        COUNT(*) AS voters,
        COUNT(*) FILTER (WHERE (2022 - birth_year) BETWEEN 18 AND 30) * 100.0 / COUNT(*) AS pct_youth,
        COUNT(*) FILTER (WHERE ethnicity = 'Malay') * 100.0 / COUNT(*) AS pct_malay,
        COUNT(*) FILTER (WHERE ethnicity = 'Chinese') * 100.0 / COUNT(*) AS pct_chinese
      FROM read_parquet('${LAKE}/voter_rolls/jhr_se15_2022.parquet')
      WHERE dun IN (
        SELECT seat FROM read_parquet('${LAKE}/results_headline/headline_ballots.parquet')
        WHERE party_uid = '120-MUDA' AND election = 'SE-15' AND state = 'Johor'
      ) AND dm NOT LIKE '%/UP%'
      GROUP BY dm, pm, saluran, dun

      UNION ALL

      SELECT dm, pm, saluran, dun AS seat, 'Solo - N9 SE15' AS era,
        COUNT(*) AS voters,
        COUNT(*) FILTER (WHERE (2023 - birth_year) BETWEEN 18 AND 30) * 100.0 / COUNT(*) AS pct_youth,
        COUNT(*) FILTER (WHERE ethnicity = 'Malay') * 100.0 / COUNT(*) AS pct_malay,
        COUNT(*) FILTER (WHERE ethnicity = 'Chinese') * 100.0 / COUNT(*) AS pct_chinese
      FROM read_parquet('${LAKE}/voter_rolls/nsn_se15_2023.parquet')
      WHERE dun IN (
        SELECT seat FROM read_parquet('${LAKE}/results_headline/headline_ballots.parquet')
        WHERE party_uid = '120-MUDA' AND election = 'SE-15' AND state = 'Negeri Sembilan'
      ) AND dm NOT LIKE '%/UP%'
      GROUP BY dm, pm, saluran, dun
    ),
    saluran_muda AS (
      SELECT date, election, state, seat, dm, pm, saluran, votes, votes_perc
      FROM read_parquet('${LAKE}/results_saluran/ge15_ballots.parquet')
      WHERE party_uid = '120-MUDA'
      UNION ALL
      SELECT date, election, state, seat, dm, pm, saluran, votes, votes_perc
      FROM read_parquet('${LAKE}/results_saluran/jhr_se15_ballots.parquet')
      WHERE party_uid = '120-MUDA'
      UNION ALL
      SELECT date, election, state, seat, dm, pm, saluran, votes, votes_perc
      FROM read_parquet('${LAKE}/results_saluran/nsn_se15_ballots.parquet')
      WHERE party_uid = '120-MUDA'
    )
    SELECT d.era, d.seat, d.dm, d.pm, d.saluran, d.voters,
           d.pct_youth, d.pct_malay, d.pct_chinese,
           v.votes AS muda_votes, v.votes_perc AS muda_vote_share
    FROM voter_agg d
    JOIN saluran_muda v ON d.dm = v.dm AND d.pm = v.pm AND d.saluran = v.saluran AND d.seat = v.seat
  `);
  fs.writeFileSync(`${outDir}/saluran-raw.json`, toJson(saluranDemo));
  console.log(`saluran-raw.json — ${saluranDemo.length} rows`);

  // TODO: aggregate saluranDemo into objective2.json / objective3.json shapes
  // (the pure-youth vs regular bucketing, racial bucketing) — port the pandas
  // logic we used in chat into JS/TS here, or keep a small Python step for this
  // part if that's easier for you.

  // Objective 4 — KL seat screen
  const objective4 = await run<Objective4Row>(`
  WITH kl_demo AS (
    SELECT
      parlimen AS seat,
      COUNT(*) AS votersTotal,
      COUNT(*) FILTER (WHERE ethnicity = 'Chinese') * 100.0 / COUNT(*) AS pctChinese,
      COUNT(*) FILTER (WHERE ethnicity = 'Malay') * 100.0 / COUNT(*) AS pctMalay,
      COUNT(*) FILTER (WHERE ethnicity = 'Indian') * 100.0 / COUNT(*) AS pctIndian
    FROM read_parquet('${LAKE}/voter_rolls/ge15_2022.parquet')
    WHERE state = 'W.P. Kuala Lumpur' AND parlimen LIKE 'P.%'
    GROUP BY parlimen
  )
  SELECT
    'GE-15' AS election,
    d.seat,
    d.votersTotal,
    ROUND(d.pctChinese, 1) AS pctChinese,
    ROUND(d.pctMalay, 1) AS pctMalay,
    ROUND(d.pctIndian, 1) AS pctIndian,
    s.majority_perc AS marginPerc,
    b.coalition AS winningCoalition
  FROM kl_demo d
  JOIN read_parquet('${LAKE}/results_headline/headline_stats.parquet') s
    ON s.seat = d.seat AND s.election = 'GE-15' AND s.state = 'W.P. Kuala Lumpur'
  JOIN read_parquet('${LAKE}/results_headline/headline_ballots.parquet') b
    ON b.seat = d.seat AND b.election = 'GE-15' AND b.state = 'W.P. Kuala Lumpur'
  WHERE b.result LIKE 'won%'
`);
  fs.writeFileSync(`${outDir}/objective4.json`, toJson(objective4));
  console.log(`objective4.json — ${objective4.length} rows`);
}

main().catch(console.error);
