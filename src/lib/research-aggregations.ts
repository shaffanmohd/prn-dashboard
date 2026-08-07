import type {
  SaluranRawRow,
  YouthPremiumPoint,
  RaceBucket,
  RaceCorrelation,
} from "@/types/research";

function weightedAvg(
  rows: SaluranRawRow[],
  valueKey: "muda_vote_share",
  weightKey: "voters",
): number {
  const totalWeight = rows.reduce((sum, r) => sum + r[weightKey], 0);
  if (totalWeight === 0) return 0;
  const weightedSum = rows.reduce(
    (sum, r) => sum + r[valueKey] * r[weightKey],
    0,
  );
  return weightedSum / totalWeight;
}

export function pearsonCorr(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n === 0) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(
    xs.reduce((s, x) => s + (x - mx) ** 2, 0) *
      ys.reduce((s, y) => s + (y - my) ** 2, 0),
  );
  return den === 0 ? 0 : num / den;
}

export function computeYouthPremium(
  rows: SaluranRawRow[],
): YouthPremiumPoint[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  return eras.map((era) => {
    const eraRows = rows.filter((r) => r.era === era);
    const pureYouth = eraRows.filter((r) => r.pct_youth >= 90);
    const regular = eraRows.filter((r) => r.pct_youth <= 10);
    return {
      era,
      pureYouthShare: Number(
        weightedAvg(pureYouth, "muda_vote_share", "voters").toFixed(1),
      ),
      regularShare: Number(
        weightedAvg(regular, "muda_vote_share", "voters").toFixed(1),
      ),
    };
  });
}

export function computeRaceBuckets(rows: SaluranRawRow[]): RaceBucket[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  const out: RaceBucket[] = [];
  for (const era of eras) {
    const eraRows = rows.filter((r) => r.era === era);
    const chinese = eraRows.filter((r) => r.pct_chinese >= 40);
    const malay = eraRows.filter((r) => r.pct_malay >= 60);
    if (chinese.length)
      out.push({
        era,
        bucket: "chinese",
        voteShare: Number(
          weightedAvg(chinese, "muda_vote_share", "voters").toFixed(1),
        ),
      });
    if (malay.length)
      out.push({
        era,
        bucket: "malay",
        voteShare: Number(
          weightedAvg(malay, "muda_vote_share", "voters").toFixed(1),
        ),
      });
  }
  return out;
}

export function computeRaceCorrelation(
  rows: SaluranRawRow[],
): RaceCorrelation[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  return eras.map((era) => {
    const eraRows = rows.filter((r) => r.era === era);
    return {
      era,
      corrMalay: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_malay),
          eraRows.map((r) => r.muda_vote_share),
        ).toFixed(2),
      ),
      corrChinese: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_chinese),
          eraRows.map((r) => r.muda_vote_share),
        ).toFixed(2),
      ),
      corrIndian: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_indian),
          eraRows.map((r) => r.muda_vote_share),
        ).toFixed(2),
      ),
    };
  });
}
export interface RankedSaluran {
  era: string;
  seat: string;
  dm: string;
  pm: string;
  saluran: number;
  voters: number;
  pctYouth: number;
  mudaVoteShare: number;
  mudaVotes: number;
}

export interface YouthScatterPoint {
  era: string;
  pctYouth: number;
  mudaVoteShare: number;
  seat: string;
  voters: number;
}

export function computeYouthScatter(
  rows: SaluranRawRow[],
): YouthScatterPoint[] {
  return rows.map((r) => ({
    era: r.era,
    pctYouth: r.pct_youth,
    mudaVoteShare: r.muda_vote_share,
    seat: r.seat,
    voters: r.voters,
  }));
}
export interface YouthCorrelation {
  era: string;
  corr: number;
}

export function computeYouthCorrelation(
  rows: SaluranRawRow[],
): YouthCorrelation[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  return eras.map((era) => {
    const eraRows = rows.filter((r) => r.era === era);
    return {
      era,
      corr: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_youth),
          eraRows.map((r) => r.muda_vote_share),
        ).toFixed(2),
      ),
    };
  });
}
export interface EraTopSummary {
  era: string;
  topNAvg: number;
  bestSeat: string;
  bestVoteShare: number;
  bestPctYouth: number;
  totalSaluran: number;
}

export function computeEraTopSummary(
  rows: SaluranRawRow[],
  topN = 10,
): EraTopSummary[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  return eras.map((era) => {
    const eraRows = rows
      .filter((r) => r.era === era)
      .slice()
      .sort((a, b) => b.muda_vote_share - a.muda_vote_share);
    const top = eraRows.slice(0, topN);
    const best = eraRows[0];
    return {
      era,
      topNAvg: top.length
        ? Number(
            (
              top.reduce((s, r) => s + r.muda_vote_share, 0) / top.length
            ).toFixed(1),
          )
        : 0,
      bestSeat: best ? `${best.seat} — ${best.dm} #${best.saluran}` : "—",
      bestVoteShare: best ? Number(best.muda_vote_share.toFixed(1)) : 0,
      bestPctYouth: best ? Number(best.pct_youth.toFixed(0)) : 0,
      totalSaluran: eraRows.length,
    };
  });
}

export interface RaceByEraRow {
  era: string;
  chinese: number | null;
  malay: number | null;
  indian: number | null;
}

export function computeRaceByEra(rows: SaluranRawRow[]): RaceByEraRow[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  return eras.map((era) => {
    const eraRows = rows.filter((r) => r.era === era);
    const chinese = eraRows.filter((r) => r.pct_chinese >= 40);
    const malay = eraRows.filter((r) => r.pct_malay >= 60);
    const indian = eraRows.filter((r) => r.pct_indian >= 15); // lower threshold — Indian-majority saluran are rare, 15%+ is already "significant"
    const wavg = (bucket: SaluranRawRow[]) =>
      bucket.length
        ? Number(
            (
              bucket.reduce((s, r) => s + r.muda_vote_share * r.voters, 0) /
              bucket.reduce((s, r) => s + r.voters, 0)
            ).toFixed(1),
          )
        : null;
    return {
      era,
      chinese: wavg(chinese),
      malay: wavg(malay), 
      indian: wavg(indian),
    };
  });
}

export interface RaceScatterPoint {
  era: string;
  seat: string;
  voters: number;
  pctMalay: number;
  pctChinese: number;
  pctIndian: number; // new
  mudaVoteShare: number;
}

export function computeRaceScatter(rows: SaluranRawRow[]): RaceScatterPoint[] {
  return rows.map((r) => ({
    era: r.era,
    seat: r.seat,
    voters: r.voters,
    pctMalay: r.pct_malay,
    pctChinese: r.pct_chinese,
    pctIndian: r.pct_indian,
    mudaVoteShare: r.muda_vote_share,
  }));
}
