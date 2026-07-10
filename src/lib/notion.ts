const NOTION_KEY = process.env.NOTION_KEY!;
const NOTION_GROUND_OPS_DB_ID = process.env.NOTION_GROUND_OPS_DB_ID!;

export enum BorangStatus {
  NotStarted = "Not started",
  Pending = "Pending",
  Done = "Done",
}

export interface BorangEntry {
  id: string; // "146/16/01_4"
  daerahMengundiId: string; // "146/16/01"
  namaPusatMengundi: string; // "SK Jalan Yusof"
  saluran: number; // 4
  seat: string; // "N.15 MAHARANI"
  isUndiAwal: number; // 1 = true, 0 = false
  jumlahKertasUndi: number; // A — 417
  undiMuda: number;
  undiBn: number;
  undiPh: number;
  undiPn: number;
  undiBersama: number;
  undiBebas: number;
  jumlahUndiPemilih: number; // formula: sum of all undi
  undiTolak: number; // C
  kertasTidakDikembalikan: number; // formula: A - jumlahUndiPemilih - undiTolak
  status: BorangStatus;
}
type NotionRichText = { text: { content: string } }[];
type NotionProperties = Record<string, NotionProperty>;

type NotionProperty = {
  title?: NotionRichText;
  rich_text?: NotionRichText;
  number?: number | null;
  select?: { name: string };
  status?: { name: string };
  formula?: { number: number };
  date?: { start: string } | null;
};

type NotionPage = {
  properties: NotionProperties;
};

type NotionQueryResponse = {
  results: NotionPage[];
  message?: string;
};

// Helper to safely read a Notion property
function prop(properties: NotionProperties, key: string): NotionProperty {
  return properties[key] ?? {};
}

export async function getGroundOpsBySeat(seat: string): Promise<BorangEntry[]> {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${NOTION_GROUND_OPS_DB_ID}/query`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${NOTION_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "seat",
          select: { equals: seat },
        },
        sorts: [
          { property: "daerah_mengundi_id", direction: "ascending" },
          { property: "saluran", direction: "ascending" },
        ],
      }),
    },
  );

  const data = (await response.json()) as NotionQueryResponse;

  if (!response.ok) throw new Error(`Notion error: ${data.message}`);

  return data.results.map((page) => {
    const p = page.properties;
    return {
      id: prop(p, "id")?.title?.[0]?.text?.content ?? "",
      daerahMengundiId: prop(p, "daerah_mengundi_id")?.select?.name ?? "",
      namaPusatMengundi: prop(p, "nama_pusat_mengundi")?.select?.name ?? "",
      saluran: prop(p, "saluran")?.number ?? 0,
      seat: prop(p, "seat")?.select?.name ?? "",
      isUndiAwal: Number(prop(p, "is_undi_awal")?.select?.name ?? 0),
      jumlahKertasUndi: prop(p, "jumlah_kertas_undi")?.number ?? 0,
      undiMuda: prop(p, "undi_muda")?.number ?? 0,
      undiBn: prop(p, "undi_bn")?.number ?? 0,
      undiPh: prop(p, "undi_ph")?.number ?? 0,
      undiPn: prop(p, "undi_pn")?.number ?? 0,
      undiBersama: prop(p, "undi_bersama")?.number ?? 0,
      undiBebas: prop(p, "undi_bebas")?.number ?? 0,
      jumlahUndiPemilih: prop(p, "jumlah_undi_pemilih")?.formula?.number ?? 0,
      undiTolak: prop(p, "undi_tolak")?.number ?? 0,
      kertasTidakDikembalikan:
        prop(p, "kertas_tidak_dikembalikan")?.formula?.number ?? 0,
      status:
        (prop(p, "status")?.status?.name as BorangStatus) ??
        BorangStatus.NotStarted,
    };
  });
}

export async function saveBorangEntry(
  entry: Omit<
    BorangEntry,
    "id" | "jumlahUndiPemilih" | "kertasTidakDikembalikan"
  >,
): Promise<string> {
  const id = `${entry.daerahMengundiId}_${entry.saluran}`;

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: NOTION_GROUND_OPS_DB_ID },
      properties: {
        id: { title: [{ text: { content: id } }] },
        daerah_mengundi_id: {
          rich_text: [{ text: { content: entry.daerahMengundiId } }],
        },
        nama_pusat_mengundi: {
          rich_text: [{ text: { content: entry.namaPusatMengundi } }],
        },

        saluran: { number: entry.saluran },
        seat: { select: { name: entry.seat } },
        is_undi_awal: { number: entry.isUndiAwal },
        jumlah_kertas_undi: { number: entry.jumlahKertasUndi },
        undi_muda: { number: entry.undiMuda },
        undi_bn: { number: entry.undiBn },
        undi_ph: { number: entry.undiPh },
        undi_pn: { number: entry.undiPn },
        undi_bersama: { number: entry.undiBersama },
        undi_bebas: { number: entry.undiBebas },
        undi_tolak: { number: entry.undiTolak },
        status: { select: { name: entry.status } },
      },
    }),
  });

  if (response.ok) return `Saved: ${id}`;
  const err = (await response.json()) as { message: string };
  return `Error: ${err.message}`;
}
