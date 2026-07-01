// ─── ElectionData.MY API shapes ───────────────────────────────────────────────
// Field names match the API docs exactly so mock → real swap is seamless

export type Coalition = "PH" | "BN" | "PN" | "ALONE" | string;

export type ContestResultStatus =
  | "won"
  | "won_uncontested"
  | "lost"
  | "lost_deposit";

export type PollingDayStatus = "before" | "counting" | "declared";

// GET /seats/dropdown
export interface SeatDropdownItem {
  seat: string; // "N.13 Maharani, Johor"
  slug: string; // "n13-maharani-johor"
  type: "parlimen" | "dun";
}

// GET /seats/results
export interface SeatHistoryEntry {
  election_name: string;
  seat: string;
  state: string;
  date: string;
  party: string;
  party_uid: string;
  coalition: string;
  coalition_uid: number;
  name: string; // winning candidate name
  majority: number;
  majority_perc: number;
  voter_turnout: number;
  voter_turnout_perc: number;
}

// Interspersed when lineage=true
export interface BoundaryChangeEvent {
  date: string;
  change_en: string;
  change_ms: string;
}

export type SeatHistoryItem = SeatHistoryEntry | BoundaryChangeEvent;

// Type guard
export function isBoundaryChangeEvent(
  item: SeatHistoryItem,
): item is BoundaryChangeEvent {
  return !("election_name" in item);
}

// GET /results
export interface BallotEntry {
  name: string;
  party_uid: string;
  party: string;
  coalition_uid: number;
  coalition: string;
  votes: number;
  votes_perc: number | null;
  result: ContestResultStatus;
}

export interface ContestStats {
  date: string;
  voters_total: number;
  voter_turnout: number;
  voter_turnout_perc: number | null;
  votes_rejected: number;
  votes_rejected_perc: number | null;
  majority: number;
  majority_perc: number | null;
}

export interface ContestResult {
  ballot: BallotEntry[];
  stats: ContestStats[];
}

// GET /candidates/dropdown
export interface CandidateDropdownItem {
  uid: string;
  name: string;
  c: number; // contests
  w: number; // won
  l: number; // lost
}

// GET /candidates?uid=
export interface CandidateContestRecord {
  name: string;
  election_name: string;
  type: "parlimen" | "dun";
  date: string;
  seat: string;
  state: string;
  party: string;
  party_uid: string;
  coalition: string;
  coalition_uid: number;
  votes: number;
  votes_perc: number | null;
  result: ContestResultStatus;
}

// ─── Saluran CSV columns (lake.electiondata.my) ───────────────────────────────
export interface SaluranBallotRow {
  seat: string;
  dm: string; // Daerah Mengundi — join key with OpenDOSM
  pm: string; // Polling centre name
  saluran: string; // e.g. "1", "2A"
  candidate_uid: string;
  name: string;
  sex: "m" | "f";
  ethnicity:
    | "malay"
    | "chinese"
    | "indian"
    | "sabah_bumiputera"
    | "sarawak_bumiputera"
    | "other";
  age: number;
  party: string;
  coalition: string;
  votes: number;
  votes_perc: number | null;
}

// Aggregated per saluran (derived from raw rows, not raw shape)
export interface SaluranSummary {
  dm: string;
  pm: string;
  saluran: string;
  totalVotes: number;
  results: {
    party: string;
    coalition: string;
    votes: number;
    votes_perc: number;
  }[];
}

// ─── OpenDOSM demography (manually matched to seat) ──────────────────────────
export interface SeatDemography {
  district: string;
  population: number;
  ethnicity: {
    malay: number;
    chinese: number;
    indian: number;
    other: number;
  };
  medianAge: number;
  medianIncome?: number;
}

// ─── Live panel state ─────────────────────────────────────────────────────────
export interface LiveState {
  status: PollingDayStatus;
  lastUpdated: string | null; // ISO timestamp
  saluransReported: number;
  saluransTotal: number;
  contest: ContestResult | null;
  swing2022: number | null; // percentage point swing vs 2022 winner
}
