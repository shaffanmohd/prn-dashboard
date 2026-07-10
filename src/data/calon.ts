export interface Calon {
  party: string;
  coalition: string;
  name: string;
  noUndian: number; // ballot order number
}

export const CALON_BY_SEAT: Record<string, Calon[]> = {
  "n15-maharani-johor": [
    { noUndian: 1, party: "PAS", coalition: "PN", name: "Mohamad Anuar Hayan" },
    {
      noUndian: 2,
      party: "UMNO",
      coalition: "BN",
      name: "Datuk Ashari Md Sarip",
    },
    {
      noUndian: 3,
      party: "MUDA",
      coalition: "MUDA",
      name: "Muhammad Amir Fiqri",
    },
    {
      noUndian: 4,
      party: "AMANAH",
      coalition: "PH",
      name: "Muhammad Taqiuddin Cheman",
    },
  ],
  "n13-simpang-jeram-johor": [
    { noUndian: 1, party: "AMANAH", coalition: "PH", name: "Nazri Abd Rahman" },
    { noUndian: 2, party: "UMNO", coalition: "BN", name: "Datuk Azman Ismail" },
    {
      noUndian: 3,
      party: "MUDA",
      coalition: "MUDA",
      name: "Ainie Haziqah Shafii",
    },
    {
      noUndian: 4,
      party: "PAS",
      coalition: "PN",
      name: "Arshed Yahya @ Awang",
    },
  ],
  "n41-puteri-wangsa-johor": [
    {
      noUndian: 1,
      party: "BERSAMA",
      coalition: "BERSAMA",
      name: "Nicholas Paul Vincent",
    },
    { noUndian: 2, party: "BEBAS", coalition: "ALONE", name: "Wang Wee Siong" },
    { noUndian: 3, party: "PKR", coalition: "PH", name: "Dr Maszlee Malik" },
    { noUndian: 4, party: "MUDA", coalition: "MUDA", name: "Rashifa Aljunied" },
    { noUndian: 5, party: "MCA", coalition: "BN", name: "Teow Chia Ling" },
  ],
  "n51-bukit-batu-johor": [
    { noUndian: 1, party: "MIC", coalition: "BN", name: "R. Kumaran" },
    {
      noUndian: 2,
      party: "BEBAS",
      coalition: "ALONE",
      name: "Kamaruzaman Ali",
    },
    { noUndian: 3, party: "BERSAMA", coalition: "BERSAMA", name: "G. Tamili" },
    { noUndian: 4, party: "PKR", coalition: "PH", name: "Chiong Sen Sern" },
    { noUndian: 5, party: "MUDA", coalition: "MUDA", name: "M. Premanand" },
  ],
};

// Maps coalition/party to which BorangEntry field holds their votes
export const COALITION_FIELD_MAP: Record<
  string,
  keyof import("@/lib/notion").BorangEntry
> = {
  MUDA: "undiMuda",
  BN: "undiBn",
  PH: "undiPh",
  PN: "undiPn",
  BERSAMA: "undiBersama",
  ALONE: "undiBebas",
};
