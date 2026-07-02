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

// headline_ballots_state_jhr.csv — 1,482 rows × 20 cols
export interface HeadlineBallotRow {
  date: string; // "12 Mar 2022"
  election: string; // "SE-15"
  state: string; // "Johor"
  seat: string; // "N.15 Maharani, Johor
  ballot_order: number;
  candidate_uid: string; // "56Y9M"
  name: string;
  name_on_ballot: string;
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
  party_uid: string;
  coalition: string;
  coalition_uid: number;
  votes: number;
  votes_perc: number | null;
  rank: number; // finishing position
  result: ContestResultStatus;
}

// headline_stats_state_jhr.csv — 624 rows × 15 cols
export interface HeadlineStatsRow {
  date: string;
  election: string;
  state: string;
  seat: string;
  voters_total: number;
  ballots_issued: number;
  ballots_not_returned: number;
  votes_rejected: number;
  votes_valid: number;
  majority: number;
  n_candidates: number;
  voter_turnout: number; // this is the % already
  majority_perc: number;
  votes_rejected_perc: number;
  ballots_not_returned_perc: number;
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

// ─── Live panel state ─────────────────────────────────────────────────────────
export interface LiveState {
  status: PollingDayStatus;
  lastUpdated: string | null;
  saluransReported: number;
  saluransTotal: number;
  dmsTotal: number;
  ballot: HeadlineBallotRow[]; // live ballot rows for this seat
  stats: HeadlineStatsRow | null; // live stats row for this seat
  swing2022: number | null;
}
