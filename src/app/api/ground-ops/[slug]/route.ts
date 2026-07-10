import { NextResponse } from "next/server";
import { getGroundOpsBySeat } from "@/lib/notion";

const SLUG_TO_SEAT: Record<string, string> = {
  "n15-maharani-johor": "N.15 MAHARANI",
  "n13-simpang-jeram-johor": "N.13 SIMPANG JERAM",
  "n41-puteri-wangsa-johor": "N.41 PUTERI WANGSA",
  "n51-bukit-batu-johor": "N.51 BUKIT BATU",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const seat = SLUG_TO_SEAT[slug];

  if (!seat) {
    return NextResponse.json({ error: "Unknown seat" }, { status: 404 });
  }

  try {
    const entries = await getGroundOpsBySeat(seat);

    const sorted = entries.sort((a, b) => {
      // Undi awal first (1 before 0)
      if (b.isUndiAwal !== a.isUndiAwal) {
        return b.isUndiAwal - a.isUndiAwal;
      }
      // Then by daerah mengundi id
      if (a.daerahMengundiId !== b.daerahMengundiId) {
        return a.daerahMengundiId.localeCompare(b.daerahMengundiId);
      }
      // Then by saluran
      return a.saluran - b.saluran;
    });

    return NextResponse.json({ entries: sorted });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
