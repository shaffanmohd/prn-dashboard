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

export function computeRankedSaluran(
  rows: SaluranRawRow[],
  topN = 10,
): RankedSaluran[] {
  const eras = [...new Set(rows.map((r) => r.era))];
  const result: RankedSaluran[] = [];
  for (const era of eras) {
    const eraRows = rows
      .filter((r) => r.era === era)
      .slice()
      .sort((a, b) => b.muda_vote_share - a.muda_vote_share)
      .slice(0, topN);
    for (const r of eraRows) {
      result.push({
        era: r.era,
        seat: r.seat,
        dm: r.dm,
        pm: r.pm,
        saluran: Number(r.saluran),
        voters: r.voters,
        pctYouth: r.pct_youth,
        mudaVoteShare: r.muda_vote_share,
        mudaVotes: r.muda_votes,
      });
    }
  }
  return result;
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
