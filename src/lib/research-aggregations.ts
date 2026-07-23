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

function pearsonCorr(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n === 0) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    denX = 0,
    denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
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
