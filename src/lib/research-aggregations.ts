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
    const pureYouth = eraRows.filter((r) => r.pct_18_30 >= 90);
    const regular = eraRows.filter((r) => r.pct_18_30 <= 10);
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
  dm: string;
  pm: string;
  saluran: number;
  voters: number;
}

export function computeYouthScatter(
  rows: SaluranRawRow[],
): YouthScatterPoint[] {
  return rows.map((r) => ({
    era: r.era,
    pctYouth: r.pct_18_30,
    mudaVoteShare: r.muda_vote_share,
    seat: r.seat,
    dm: r.dm,
    pm: r.pm,
    saluran: Number(r.saluran),
    voters: r.voters,
  }));
}
export interface AgeBandCorrelation {
  era: string;
  corr18to30: number;
  corr31to40: number;
  corr41to50: number;
  corr51to60: number;
  corr61to70: number;
  corr71to80: number;
  corr81plus: number;
}

export function computeAgeBandCorrelation(
  rows: SaluranRawRow[],
): AgeBandCorrelation[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  return eras.map((era) => {
    const eraRows = rows.filter((r) => r.era === era);
    const share = eraRows.map((r) => r.muda_vote_share);
    return {
      era,
      corr18to30: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_18_30),
          share,
        ).toFixed(2),
      ),
      corr31to40: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_31_40),
          share,
        ).toFixed(2),
      ),
      corr41to50: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_41_50),
          share,
        ).toFixed(2),
      ),
      corr51to60: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_51_60),
          share,
        ).toFixed(2),
      ),
      corr61to70: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_61_70),
          share,
        ).toFixed(2),
      ),
      corr71to80: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_71_80),
          share,
        ).toFixed(2),
      ),
      corr81plus: Number(
        pearsonCorr(
          eraRows.map((r) => r.pct_81_plus),
          share,
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
      bestPctYouth: best ? Number(best.pct_18_30.toFixed(0)) : 0,
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
  dm: string;
  pm: string;
  saluran: number;
  voters: number;
  pctMalay: number;
  pctChinese: number;
  pctIndian: number;
  mudaVoteShare: number;
}

export function computeRaceScatter(rows: SaluranRawRow[]): RaceScatterPoint[] {
  return rows.map((r) => ({
    era: r.era,
    seat: r.seat,
    dm: r.dm,
    pm: r.pm,
    saluran: Number(r.saluran),
    voters: r.voters,
    pctMalay: r.pct_malay,
    pctChinese: r.pct_chinese,
    pctIndian: r.pct_indian,
    mudaVoteShare: r.muda_vote_share,
  }));
}
export interface SeatProfile {
  seat: string;
  era: string;
  pctChinese: number;
  pctMalay: number;
  pctYouth: number;
  voteShare: number;
  result: string;
}

export function computeSeatProfiles(
  rows: SaluranRawRow[],
  objective1: {
    seat: string;
    era: string;
    voteShare: number | null;
    result: string;
  }[],
  eraGroup: "pact" | "solo",
): SeatProfile[] {
  const filteredRows = rows.filter((r) =>
    eraGroup === "pact" ? r.era.startsWith("Pact") : r.era.startsWith("Solo"),
  );
  const seats = [...new Set(filteredRows.map((r) => r.seat))];

  return seats
    .map((seat) => {
      const seatRows = filteredRows.filter((r) => r.seat === seat);
      const totalVoters = seatRows.reduce((s, r) => s + r.voters, 0);
      const wavg = (key: "pct_chinese" | "pct_malay" | "pct_18_30") =>
        totalVoters
          ? seatRows.reduce((s, r) => s + r[key] * r.voters, 0) / totalVoters
          : 0;

      const match = objective1.find(
        (o) => o.seat === seat && o.era === eraGroup,
      );

      return {
        seat,
        era: seatRows[0].era,
        pctChinese: Number(wavg("pct_chinese").toFixed(1)),
        pctMalay: Number(wavg("pct_malay").toFixed(1)),
        pctYouth: Number(wavg("pct_18_30").toFixed(1)),
        voteShare: match?.voteShare ?? 0,
        result: match?.result ?? "unknown",
      };
    })
    .filter((s) => s.result !== "unknown");
}

export interface SeatMatch extends SeatProfile {
  distance: number;
}

export interface SeatPrediction {
  weighting: "chinese-weighted" | "malay-weighted" | "equal";
  nearest: SeatMatch[];
  predictedVoteShare: number;
  wouldBeCompetitive: boolean;
}

function normalize(value: number, min: number, max: number) {
  return max === min ? 0.5 : (value - min) / (max - min);
}

export function predictSeat(
  target: { pctChinese: number; pctMalay: number; pctYouth: number },
  seats: SeatProfile[],
  weighting: "chinese-weighted" | "malay-weighted" | "equal",
  k = 3,
): SeatPrediction | null {
  if (seats.length === 0) return null;

  const chineseRange = [
    Math.min(...seats.map((s) => s.pctChinese)),
    Math.max(...seats.map((s) => s.pctChinese)),
  ];
  const malayRange = [
    Math.min(...seats.map((s) => s.pctMalay)),
    Math.max(...seats.map((s) => s.pctMalay)),
  ];
  const youthRange = [
    Math.min(...seats.map((s) => s.pctYouth)),
    Math.max(...seats.map((s) => s.pctYouth)),
  ];

  const weightSchemes = {
    "chinese-weighted": { chinese: 0.6, malay: 0.3, youth: 0.1 },
    "malay-weighted": { chinese: 0.15, malay: 0.55, youth: 0.3 },
    equal: { chinese: 0.34, malay: 0.33, youth: 0.33 },
  };
  const w = weightSchemes[weighting];
  const tChinese = normalize(
    target.pctChinese,
    chineseRange[0],
    chineseRange[1],
  );
  const tMalay = normalize(target.pctMalay, malayRange[0], malayRange[1]);
  const tYouth = normalize(target.pctYouth, youthRange[0], youthRange[1]);

  const withDistance: SeatMatch[] = seats.map((s) => {
    const sChinese = normalize(s.pctChinese, chineseRange[0], chineseRange[1]);
    const sMalay = normalize(s.pctMalay, malayRange[0], malayRange[1]);
    const sYouth = normalize(s.pctYouth, youthRange[0], youthRange[1]);
    const distance = Math.sqrt(
      w.chinese * (tChinese - sChinese) ** 2 +
        w.malay * (tMalay - sMalay) ** 2 +
        w.youth * (tYouth - sYouth) ** 2,
    );
    return { ...s, distance: Number(distance.toFixed(4)) };
  });

  const nearest = withDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);

  // Inverse-distance weighted average vote share (avoid divide-by-zero for an exact match)
  const weights = nearest.map((n) => 1 / (n.distance + 0.01));
  const totalWeight = weights.reduce((s, x) => s + x, 0);
  const predictedVoteShare = Number(
    nearest.reduce((s, n, i) => s + n.voteShare * weights[i], 0) / totalWeight,
  );

  return {
    weighting,
    nearest,
    predictedVoteShare,
    wouldBeCompetitive: predictedVoteShare >= 35, // near MUDA's two actual wins (38%, 43-44%)
  };
}

export interface SelectionSummary {
  totalVoters: number;
  weightedVoteShare: number;
  ageComposition: { band: string; pct: number }[];
}

export function computeSelectionSummary(
  rows: SaluranRawRow[],
): SelectionSummary {
  const totalVoters = rows.reduce((s, r) => s + r.voters, 0);

  const weightedVoteShare = totalVoters
    ? rows.reduce((s, r) => s + r.muda_vote_share * r.voters, 0) / totalVoters
    : 0;

  const wavgBand = (key: keyof SaluranRawRow) =>
    totalVoters
      ? rows.reduce((s, r) => s + (r[key] as number) * r.voters, 0) /
        totalVoters
      : 0;

  const ageComposition = [
    { band: "18-30", pct: Number(wavgBand("pct_18_30").toFixed(1)) },
    { band: "31-40", pct: Number(wavgBand("pct_31_40").toFixed(1)) },
    { band: "41-50", pct: Number(wavgBand("pct_41_50").toFixed(1)) },
    { band: "51-60", pct: Number(wavgBand("pct_51_60").toFixed(1)) },
    { band: "61-70", pct: Number(wavgBand("pct_61_70").toFixed(1)) },
    { band: "71-80", pct: Number(wavgBand("pct_71_80").toFixed(1)) },
    { band: "81+", pct: Number(wavgBand("pct_81_plus").toFixed(1)) },
  ];

  return {
    totalVoters,
    weightedVoteShare: Number(weightedVoteShare.toFixed(2)),
    ageComposition,
  };
}
export interface RaceSelectionSummary {
  totalVoters: number;
  weightedVoteShare: number;
  raceComposition: { race: string; pct: number }[];
}

export function computeRaceSelectionSummary(
  rows: SaluranRawRow[],
): RaceSelectionSummary {
  const totalVoters = rows.reduce((s, r) => s + r.voters, 0);

  const weightedVoteShare = totalVoters
    ? rows.reduce((s, r) => s + r.muda_vote_share * r.voters, 0) / totalVoters
    : 0;

  const wavgRace = (key: "pct_malay" | "pct_chinese" | "pct_indian") =>
    totalVoters
      ? rows.reduce((s, r) => s + r[key] * r.voters, 0) / totalVoters
      : 0;

  const malay = wavgRace("pct_malay");
  const chinese = wavgRace("pct_chinese");
  const indian = wavgRace("pct_indian");
  const other = Math.max(0, 100 - malay - chinese - indian);

  const raceComposition = [
    { race: "Malay", pct: Number(malay.toFixed(1)) },
    { race: "Chinese", pct: Number(chinese.toFixed(1)) },
    { race: "Indian", pct: Number(indian.toFixed(1)) },
    { race: "Other", pct: Number(other.toFixed(1)) },
  ];

  return {
    totalVoters,
    weightedVoteShare: Number(weightedVoteShare.toFixed(2)),
    raceComposition,
  };
}
export interface AgeTrendPoint {
  band: string;
  bandOrder: number;
  [era: string]: string | number;
}

const AGE_BANDS: { key: keyof SaluranRawRow; label: string; order: number }[] =
  [
    { key: "pct_18_30", label: "18-30", order: 1 },
    { key: "pct_31_40", label: "31-40", order: 2 },
    { key: "pct_41_50", label: "41-50", order: 3 },
    { key: "pct_51_60", label: "51-60", order: 4 },
    { key: "pct_61_70", label: "61-70", order: 5 },
    { key: "pct_71_80", label: "71-80", order: 6 },
    { key: "pct_81_plus", label: "81+", order: 7 },
  ];

export function computeAgeTrend(rows: SaluranRawRow[]): AgeTrendPoint[] {
  const eras = [...new Set(rows.map((r) => r.era))];

  return AGE_BANDS.map(({ key, label, order }) => {
    const point: AgeTrendPoint = { band: label, bandOrder: order };

    for (const era of eras) {
      const eraRows = rows.filter((r) => r.era === era);
      const sorted = [...eraRows].sort(
        (a, b) => (b[key] as number) - (a[key] as number),
      );
      const topQuartile = sorted.slice(
        0,
        Math.max(1, Math.ceil(sorted.length * 0.25)),
      );
      const totalVoters = topQuartile.reduce((s, r) => s + r.voters, 0);
      const weightedShare = totalVoters
        ? topQuartile.reduce((s, r) => s + r.muda_vote_share * r.voters, 0) /
          totalVoters
        : 0;
      point[era] = Number(weightedShare.toFixed(1));
    }

    return point;
  });
}
