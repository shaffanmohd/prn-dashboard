export type Era = "pact" | "solo";

export interface PactSoloSeat {
  date: string;
  election: string;
  state: string;
  seat: string;
  coalition: string;
  voteShare: number | null;
  result: "won" | "won_uncontested" | "lost" | "lost_deposit";
  era: Era;
}

export interface SaluranRawRow {
  era: string;
  seat: string;
  dm: string;
  pm: string;
  saluran: number;
  voters: number;
  pct_youth: number;
  pct_malay: number;
  pct_chinese: number;
  pct_indian: number;
  muda_votes: number;
  muda_vote_share: number;
}

export interface YouthPremiumPoint {
  era: string;
  pureYouthShare: number;
  regularShare: number;
}

export interface RaceBucket {
  era: string;
  bucket: "chinese" | "malay" | "indian" | "mixed";
  voteShare: number;
}

export interface RaceCorrelation {
  era: string;
  corrMalay: number;
  corrChinese: number;
  corrIndian: number; 
}

export interface KLSeatScreen {
  election: string;
  seat: string;
  votersTotal: number;
  pctChinese: number;
  pctMalay: number;
  pctIndian: number;
  marginPerc: number | null;
  winningCoalition: string;
}
