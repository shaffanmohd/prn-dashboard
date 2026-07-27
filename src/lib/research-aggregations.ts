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
export interface SeatSaluranBreakdown {
  era: string;
  seat: string;
  totalSaluran: number;
  pureYouthCount: number;
  mixedCount: number;
  regularCount: number;
  pctPureYouth: number;
}

export interface EraSaluranSummary {
  era: string;
  totalSaluran: number;
  totalPureYouth: number;
  pctPureYouth: number;
}

export function computeSeatSaluranBreakdown(
  rows: SaluranRawRow[],
): SeatSaluranBreakdown[] {
  const key = (r: SaluranRawRow) => `${r.era}|||${r.seat}`;
  const groups = new Map<string, SaluranRawRow[]>();
  for (const r of rows) {
    const k = key(r);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }

  return Array.from(groups.entries())
    .map(([k, seatRows]) => {
      const [era, seat] = k.split("|||");
      const totalSaluran = seatRows.length;
      const pureYouthCount = seatRows.filter((r) => r.pct_youth >= 90).length;
      return {
        era,
        seat,
        totalSaluran,
        pureYouthCount,
        regularCount: seatRows.filter((r) => r.pct_youth <= 10).length,
        mixedCount: seatRows.filter((r) => r.pct_youth > 10 && r.pct_youth < 90)
          .length,
        pctPureYouth: totalSaluran
          ? Number(((pureYouthCount / totalSaluran) * 100).toFixed(1))
          : 0,
      };
    })
    .sort((a, b) => a.era.localeCompare(b.era) || a.seat.localeCompare(b.seat));
}

export function computeEraSaluranSummary(
  breakdown: SeatSaluranBreakdown[],
): EraSaluranSummary[] {
  const eras = [...new Set(breakdown.map((b) => b.era))];
  return eras.map((era) => {
    const rows = breakdown.filter((b) => b.era === era);
    const totalSaluran = rows.reduce((sum, r) => sum + r.totalSaluran, 0);
    const totalPureYouth = rows.reduce((sum, r) => sum + r.pureYouthCount, 0);
    return {
      era,
      totalSaluran,
      totalPureYouth,
      pctPureYouth: totalSaluran
        ? Number(((totalPureYouth / totalSaluran) * 100).toFixed(1))
        : 0,
    };
  });
}
