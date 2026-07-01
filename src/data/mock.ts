import type {
  SeatDropdownItem,
  SeatHistoryItem,
  ContestResult,
  CandidateContestRecord,
  SeatDemography,
  LiveState,
  SaluranBallotRow,
} from "@/types/election";

// ─── Seat picker ──────────────────────────────────────────────────────────────
export const MOCK_SEATS: SeatDropdownItem[] = [
  { seat: "N.13 Maharani, Johor", slug: "n13-maharani-johor", type: "dun" },
  { seat: "N.07 Puteri Wangsa, Johor", slug: "n07-puteri-wangsa-johor", type: "dun" },
];

// ─── Seat history ─────────────────────────────────────────────────────────────
export const MOCK_SEAT_HISTORY: Record<string, SeatHistoryItem[]> = {
  "n13-maharani-johor": [
    {
      election_name: "SE-15", seat: "N.13 Maharani", state: "Johor",
      date: "2022-03-12", party: "DAP", party_uid: "021-DAP",
      coalition: "PH", coalition_uid: 1, name: "Faisal Halim",
      majority: 2776, majority_perc: 8.4,
      voter_turnout: 33050, voter_turnout_perc: 78.1,
    },
    {
      election_name: "SE-14", seat: "N.13 Maharani", state: "Johor",
      date: "2018-05-09", party: "DAP", party_uid: "021-DAP",
      coalition: "PH", coalition_uid: 1, name: "Faisal Halim",
      majority: 4380, majority_perc: 14.2,
      voter_turnout: 30822, voter_turnout_perc: 81.6,
    },
    {
      election_name: "SE-13", seat: "N.13 Maharani", state: "Johor",
      date: "2013-05-05", party: "UMNO", party_uid: "001-UMNO",
      coalition: "BN", coalition_uid: 2, name: "Aziz Kaprawi",
      majority: 1890, majority_perc: 6.7,
      voter_turnout: 28210, voter_turnout_perc: 84.3,
    },
    {
      date: "1994-06-01",
      change_en: "Maharani created from Sungai Balang in the 1994 redelineation",
      change_ms: "Maharani diwujudkan daripada Sungai Balang dalam persempadanan semula 1994",
    },
    {
      election_name: "SE-9", seat: "Sungai Balang", state: "Johor",
      date: "1990-10-21", party: "UMNO", party_uid: "001-UMNO",
      coalition: "BN", coalition_uid: 2, name: "Hassan Yunos",
      majority: 5120, majority_perc: 22.1,
      voter_turnout: 23170, voter_turnout_perc: 74.2,
    },
  ],
  "n07-puteri-wangsa-johor": [
    {
      election_name: "SE-15", seat: "N.07 Puteri Wangsa", state: "Johor",
      date: "2022-03-12", party: "UMNO", party_uid: "001-UMNO",
      coalition: "BN", coalition_uid: 2, name: "Nuraini Shahar",
      majority: 3375, majority_perc: 11.6,
      voter_turnout: 29100, voter_turnout_perc: 74.8,
    },
    {
      election_name: "SE-14", seat: "N.07 Puteri Wangsa", state: "Johor",
      date: "2018-05-09", party: "AMANAH", party_uid: "030-AMANAH",
      coalition: "PH", coalition_uid: 1, name: "Hafiz Rahman",
      majority: 980, majority_perc: 3.2,
      voter_turnout: 27410, voter_turnout_perc: 79.4,
    },
    {
      election_name: "SE-13", seat: "N.07 Puteri Wangsa", state: "Johor",
      date: "2013-05-05", party: "UMNO", party_uid: "001-UMNO",
      coalition: "BN", coalition_uid: 2, name: "Shahril Tan",
      majority: 2640, majority_perc: 9.8,
      voter_turnout: 26900, voter_turnout_perc: 83.0,
    },
  ],
};

// ─── Latest contest (2022) ────────────────────────────────────────────────────
export const MOCK_LATEST_CONTEST: Record<string, ContestResult> = {
  "n13-maharani-johor": {
    ballot: [
      { name: "Faisal Halim", party_uid: "021-DAP", party: "DAP", coalition_uid: 1, coalition: "PH", votes: 14582, votes_perc: 44.1, result: "won" },
      { name: "Zulkifli Ahmad", party_uid: "001-UMNO", party: "UMNO", coalition_uid: 2, coalition: "BN", votes: 11806, votes_perc: 35.7, result: "lost" },
      { name: "Rosli Mat Som", party_uid: "010-BERSATU", party: "BERSATU", coalition_uid: 3, coalition: "PN", votes: 6320, votes_perc: 19.1, result: "lost" },
      { name: "Tan Wei Ming", party_uid: "000-IND", party: "IND", coalition_uid: 0, coalition: "ALONE", votes: 342, votes_perc: 1.1, result: "lost_deposit" },
    ],
    stats: [{
      date: "2022-03-12", voters_total: 42318,
      voter_turnout: 33050, voter_turnout_perc: 78.1,
      votes_rejected: 312, votes_rejected_perc: 0.9,
      majority: 2776, majority_perc: 8.4,
    }],
  },
  "n07-puteri-wangsa-johor": {
    ballot: [
      { name: "Nuraini Shahar", party_uid: "001-UMNO", party: "UMNO", coalition_uid: 2, coalition: "BN", votes: 15890, votes_perc: 54.6, result: "won" },
      { name: "Hafiz Rahman", party_uid: "030-AMANAH", party: "AMANAH", coalition_uid: 1, coalition: "PH", votes: 12515, votes_perc: 43.0, result: "lost" },
      { name: "Lim Choon Hock", party_uid: "000-IND", party: "IND", coalition_uid: 0, coalition: "ALONE", votes: 695, votes_perc: 2.4, result: "lost_deposit" },
    ],
    stats: [{
      date: "2022-03-12", voters_total: 38904,
      voter_turnout: 29100, voter_turnout_perc: 74.8,
      votes_rejected: 198, votes_rejected_perc: 0.7,
      majority: 3375, majority_perc: 11.6,
    }],
  },
};

// ─── Candidates ───────────────────────────────────────────────────────────────
export const MOCK_CANDIDATES: Record<string, CandidateContestRecord[]> = {
  "n13-maharani-johor": [
    { name: "Faisal Halim", election_name: "SE-15", type: "dun", date: "2022-03-12", seat: "N.13 Maharani", state: "Johor", party: "DAP", party_uid: "021-DAP", coalition: "PH", coalition_uid: 1, votes: 14582, votes_perc: 44.1, result: "won" },
    { name: "Faisal Halim", election_name: "SE-14", type: "dun", date: "2018-05-09", seat: "N.13 Maharani", state: "Johor", party: "DAP", party_uid: "021-DAP", coalition: "PH", coalition_uid: 1, votes: 13290, votes_perc: 47.8, result: "won" },
    { name: "Zulkifli Ahmad", election_name: "SE-15", type: "dun", date: "2022-03-12", seat: "N.13 Maharani", state: "Johor", party: "UMNO", party_uid: "001-UMNO", coalition: "BN", coalition_uid: 2, votes: 11806, votes_perc: 35.7, result: "lost" },
    { name: "Zulkifli Ahmad", election_name: "SE-13", type: "dun", date: "2013-05-05", seat: "N.13 Maharani", state: "Johor", party: "UMNO", party_uid: "001-UMNO", coalition: "BN", coalition_uid: 2, votes: 14200, votes_perc: 50.3, result: "won" },
  ],
  "n07-puteri-wangsa-johor": [
    { name: "Nuraini Shahar", election_name: "SE-15", type: "dun", date: "2022-03-12", seat: "N.07 Puteri Wangsa", state: "Johor", party: "UMNO", party_uid: "001-UMNO", coalition: "BN", coalition_uid: 2, votes: 15890, votes_perc: 54.6, result: "won" },
    { name: "Nuraini Shahar", election_name: "SE-14", type: "dun", date: "2018-05-09", seat: "N.07 Puteri Wangsa", state: "Johor", party: "UMNO", party_uid: "001-UMNO", coalition: "BN", coalition_uid: 2, votes: 11200, votes_perc: 40.9, result: "lost" },
    { name: "Hafiz Rahman", election_name: "SE-15", type: "dun", date: "2022-03-12", seat: "N.07 Puteri Wangsa", state: "Johor", party: "AMANAH", party_uid: "030-AMANAH", coalition: "PH", coalition_uid: 1, votes: 12515, votes_perc: 43.0, result: "lost" },
    { name: "Hafiz Rahman", election_name: "SE-14", type: "dun", date: "2018-05-09", seat: "N.07 Puteri Wangsa", state: "Johor", party: "AMANAH", party_uid: "030-AMANAH", coalition: "PH", coalition_uid: 1, votes: 14020, votes_perc: 51.2, result: "won" },
  ],
};

// ─── Demography (DOSM, manually mapped) ──────────────────────────────────────
export const MOCK_DEMOGRAPHY: Record<string, SeatDemography> = {
  "n13-maharani-johor": {
    district: "Muar", population: 205000, medianAge: 36, medianIncome: 4800,
    ethnicity: { malay: 58, chinese: 34, indian: 6, other: 2 },
  },
  "n07-puteri-wangsa-johor": {
    district: "Johor Bahru", population: 190500, medianAge: 33, medianIncome: 5600,
    ethnicity: { malay: 49, chinese: 41, indian: 9, other: 1 },
  },
};

// ─── Saluran mock data ────────────────────────────────────────────────────────
export const MOCK_SALURAN: Record<string, SaluranBallotRow[]> = {
  "n13-maharani-johor": [
    { seat: "N.13 Maharani", dm: "Parit Maharani", pm: "SK Parit Maharani", saluran: "1", candidate_uid: "faisal-halim", name: "Faisal Halim", sex: "m", ethnicity: "malay", age: 45, party: "DAP", coalition: "PH", votes: 620, votes_perc: 41.1 },
    { seat: "N.13 Maharani", dm: "Parit Maharani", pm: "SK Parit Maharani", saluran: "1", candidate_uid: "zulkifli-ahmad", name: "Zulkifli Ahmad", sex: "m", ethnicity: "malay", age: 52, party: "UMNO", coalition: "BN", votes: 510, votes_perc: 33.8 },
    { seat: "N.13 Maharani", dm: "Parit Maharani", pm: "SK Parit Maharani", saluran: "1", candidate_uid: "rosli-mat-som", name: "Rosli Mat Som", sex: "m", ethnicity: "malay", age: 48, party: "BERSATU", coalition: "PN", votes: 377, votes_perc: 25.0 },
    { seat: "N.13 Maharani", dm: "Parit Maharani", pm: "SK Parit Maharani", saluran: "2", candidate_uid: "faisal-halim", name: "Faisal Halim", sex: "m", ethnicity: "malay", age: 45, party: "DAP", coalition: "PH", votes: 540, votes_perc: 43.5 },
    { seat: "N.13 Maharani", dm: "Parit Maharani", pm: "SK Parit Maharani", saluran: "2", candidate_uid: "zulkifli-ahmad", name: "Zulkifli Ahmad", sex: "m", ethnicity: "malay", age: 52, party: "UMNO", coalition: "BN", votes: 480, votes_perc: 38.7 },
    { seat: "N.13 Maharani", dm: "Parit Maharani", pm: "SK Parit Maharani", saluran: "2", candidate_uid: "rosli-mat-som", name: "Rosli Mat Som", sex: "m", ethnicity: "malay", age: 48, party: "BERSATU", coalition: "PN", votes: 221, votes_perc: 17.8 },
    { seat: "N.13 Maharani", dm: "Bandar Maharani", pm: "SRJK Maharani", saluran: "1", candidate_uid: "faisal-halim", name: "Faisal Halim", sex: "m", ethnicity: "malay", age: 45, party: "DAP", coalition: "PH", votes: 890, votes_perc: 62.4 },
    { seat: "N.13 Maharani", dm: "Bandar Maharani", pm: "SRJK Maharani", saluran: "1", candidate_uid: "zulkifli-ahmad", name: "Zulkifli Ahmad", sex: "m", ethnicity: "malay", age: 52, party: "UMNO", coalition: "BN", votes: 310, votes_perc: 21.7 },
    { seat: "N.13 Maharani", dm: "Bandar Maharani", pm: "SRJK Maharani", saluran: "1", candidate_uid: "rosli-mat-som", name: "Rosli Mat Som", sex: "m", ethnicity: "malay", age: 48, party: "BERSATU", coalition: "PN", votes: 227, votes_perc: 15.9 },
  ],
  "n07-puteri-wangsa-johor": [
    { seat: "N.07 Puteri Wangsa", dm: "Permas Jaya", pm: "SK Permas Jaya", saluran: "1", candidate_uid: "nuraini-shahar", name: "Nuraini Shahar", sex: "f", ethnicity: "malay", age: 49, party: "UMNO", coalition: "BN", votes: 780, votes_perc: 55.3 },
    { seat: "N.07 Puteri Wangsa", dm: "Permas Jaya", pm: "SK Permas Jaya", saluran: "1", candidate_uid: "hafiz-rahman", name: "Hafiz Rahman", sex: "m", ethnicity: "malay", age: 44, party: "AMANAH", coalition: "PH", votes: 630, votes_perc: 44.7 },
    { seat: "N.07 Puteri Wangsa", dm: "Permas Jaya", pm: "SK Permas Jaya", saluran: "2", candidate_uid: "nuraini-shahar", name: "Nuraini Shahar", sex: "f", ethnicity: "malay", age: 49, party: "UMNO", coalition: "BN", votes: 620, votes_perc: 51.2 },
    { seat: "N.07 Puteri Wangsa", dm: "Permas Jaya", pm: "SK Permas Jaya", saluran: "2", candidate_uid: "hafiz-rahman", name: "Hafiz Rahman", sex: "m", ethnicity: "malay", age: 44, party: "AMANAH", coalition: "PH", votes: 591, votes_perc: 48.8 },
    { seat: "N.07 Puteri Wangsa", dm: "Masai", pm: "SMK Masai", saluran: "1", candidate_uid: "nuraini-shahar", name: "Nuraini Shahar", sex: "f", ethnicity: "malay", age: 49, party: "UMNO", coalition: "BN", votes: 510, votes_perc: 58.0 },
    { seat: "N.07 Puteri Wangsa", dm: "Masai", pm: "SMK Masai", saluran: "1", candidate_uid: "hafiz-rahman", name: "Hafiz Rahman", sex: "m", ethnicity: "malay", age: 44, party: "AMANAH", coalition: "PH", votes: 370, votes_perc: 42.0 },
  ],
};

// ─── Live polling day state (mock: mid-count scenario) ────────────────────────
export const MOCK_LIVE: Record<string, LiveState> = {
  "n13-maharani-johor": {
    status: "counting",
    lastUpdated: new Date().toISOString(),
    saluransReported: 14,
    saluransTotal: 22,
    swing2022: -2.3,   // negative = PH doing slightly worse than 2022
    contest: {
      ballot: [
        { name: "Faisal Halim", party_uid: "021-DAP", party: "DAP", coalition_uid: 1, coalition: "PH", votes: 8920, votes_perc: 44.9, result: "won" },
        { name: "Zulkifli Ahmad", party_uid: "001-UMNO", party: "UMNO", coalition_uid: 2, coalition: "BN", votes: 7140, votes_perc: 35.9, result: "lost" },
        { name: "Rosli Mat Som", party_uid: "010-BERSATU", party: "BERSATU", coalition_uid: 3, coalition: "PN", votes: 3550, votes_perc: 17.9, result: "lost" },
        { name: "Tan Wei Ming", party_uid: "000-IND", party: "IND", coalition_uid: 0, coalition: "ALONE", votes: 240, votes_perc: 1.2, result: "lost_deposit" },
      ],
      stats: [{
        date: "2026-07-11", voters_total: 43100,
        voter_turnout: 19850, voter_turnout_perc: 46.1,
        votes_rejected: 98, votes_rejected_perc: 0.5,
        majority: 1780, majority_perc: 9.0,
      }],
    },
  },
  "n07-puteri-wangsa-johor": {
    status: "before",
    lastUpdated: null,
    saluransReported: 0,
    saluransTotal: 18,
    swing2022: null,
    contest: null,
  },
};