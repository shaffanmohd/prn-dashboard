"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";
import { Navbar } from "@/components/dashboard/Navbar";
import { LiveSummaryStrip } from "@/components/dashboard/LiveSummaryStrip";
import { SaluranProgressBar } from "@/components/dashboard/SaluranProgressBar";
import { MOCK_SEATS, MOCK_LIVE } from "@/data/mock";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCoalitionBadge, getCoalitionColor } from "@/lib/coalition";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function LiveDetailPage({ params }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const MOCK_TM_SUMMARY = [
    {
      pm: "SK Parit Maharani",
      dm: "Parit Maharani",
      saluran_list: "1, 2, 3",
      saluran_done: 3,
      saluran_total: 3,
      status: "done" as const,
      leading: "PAS +420",
      voters: 1240,
      turnout_perc: 78.2,
    },
    {
      pm: "SK Parit Maharani",
      dm: "Parit Unas",
      saluran_list: "4, 5",
      saluran_done: 1,
      saluran_total: 2,
      status: "counting" as const,
      leading: "PAS +95",
      voters: 820,
      turnout_perc: 61.4,
    },
    {
      pm: "Dewan Orang Ramai Muar",
      dm: "Bandar Maharani",
      saluran_list: "1, 2, 3",
      saluran_done: 0,
      saluran_total: 3,
      status: "pending" as const,
      leading: null,
      voters: 980,
      turnout_perc: null,
    },
    {
      pm: "SMK Maharani",
      dm: "Jalan Khalidi",
      saluran_list: "1, 2, 3, 4",
      saluran_done: 0,
      saluran_total: 4,
      status: "pending" as const,
      leading: null,
      voters: 1560,
      turnout_perc: null,
    },
    {
      pm: "SK Tanjong",
      dm: "Tanjong",
      saluran_list: "1, 2",
      saluran_done: 2,
      saluran_total: 2,
      status: "done" as const,
      leading: "PN +210",
      voters: 640,
      turnout_perc: 82.5,
    },
  ];

  const MOCK_SALURAN_DETAIL: Record<
    number,
    {
      saluran: string;
      status: "done" | "pending";
      voters: number;
      votes_cast: number | null;
      parties: { party: string; coalition: string; votes: number }[];
    }[]
  > = {
    0: [
      {
        saluran: "1",
        status: "done",
        voters: 420,
        votes_cast: 338,
        parties: [
          { party: "PAS", coalition: "PN", votes: 180 },
          { party: "PKR", coalition: "PH", votes: 120 },
          { party: "UMNO", coalition: "BN", votes: 98 },
        ],
      },
      {
        saluran: "2",
        status: "done",
        voters: 410,
        votes_cast: 322,
        parties: [
          { party: "PAS", coalition: "PN", votes: 145 },
          { party: "PKR", coalition: "PH", votes: 110 },
          { party: "UMNO", coalition: "BN", votes: 87 },
        ],
      },
      {
        saluran: "3",
        status: "done",
        voters: 410,
        votes_cast: 310,
        parties: [
          { party: "PAS", coalition: "PN", votes: 162 },
          { party: "PKR", coalition: "PH", votes: 118 },
          { party: "UMNO", coalition: "BN", votes: 75 },
        ],
      },
    ],
    1: [
      {
        saluran: "4",
        status: "done",
        voters: 420,
        votes_cast: 295,
        parties: [
          { party: "PAS", coalition: "PN", votes: 130 },
          { party: "PKR", coalition: "PH", votes: 95 },
          { party: "UMNO", coalition: "BN", votes: 70 },
        ],
      },
      {
        saluran: "5",
        status: "pending",
        voters: 400,
        votes_cast: null,
        parties: [],
      },
    ],
  };
  const { slug } = use(params);
  const router = useRouter();

  const seatName = MOCK_SEATS.find((s) => s.slug === slug)?.seat ?? slug;
  const live = MOCK_LIVE[slug];

  if (!live) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <p className="text-muted-foreground">No live data for this seat.</p>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mt-4"
            >
              ← Back
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          {/* Back + seat label */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-1 pl-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{seatName}</span>
            </div>
          </div>

          {/* Live summary strip */}
          <Card>
            <CardContent className="pt-5">
              <LiveSummaryStrip live={live} />
            </CardContent>
          </Card>

          {/* Saluran progress */}
          <SaluranProgressBar live={live} />

          {/* Saluran detail — placeholder until confirmed */}
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Tempat Mengundi · Saluran breakdown
                </CardTitle>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                  Awaiting confirmation
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Tempat Mengundi · Saluran breakdown
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs text-amber-600 border-amber-300 bg-amber-50"
                    >
                      Mock data — SE-16 TBC
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click any row to see per-saluran detail
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tempat Mengundi</TableHead>
                        <TableHead>Daerah Mengundi</TableHead>
                        <TableHead className="text-center">Saluran</TableHead>
                        <TableHead className="text-center">Progress</TableHead>
                        <TableHead className="text-center">Turnout</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Leading</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_TM_SUMMARY.map((row, i) => (
                        <>
                          <TableRow
                            key={`row-${i}`}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() =>
                              setExpanded(expanded === i ? null : i)
                            }
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`transition-transform duration-200 text-muted-foreground text-xs ${expanded === i ? "rotate-90" : ""}`}
                                >
                                  ›
                                </span>
                                {row.pm}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {row.dm}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                              {row.saluran_list}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-xs font-mono">
                                {row.saluran_done}/{row.saluran_total}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {row.turnout_perc !== null ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-xs font-mono font-medium">
                                    {row.turnout_perc.toFixed(1)}%
                                  </span>
                                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${row.turnout_perc}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {row.voters} reg.
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {row.status === "done" && (
                                <Badge variant="success">✓ Done</Badge>
                              )}
                              {row.status === "counting" && (
                                <Badge variant="warning">⏳ Counting</Badge>
                              )}
                              {row.status === "pending" && (
                                <Badge variant="muted">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {row.leading ?? (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Accordion */}
                          {expanded === i && (
                            <TableRow
                              key={`expanded-${i}`}
                              className="accordion-open"
                            >
                              <TableCell
                                colSpan={7}
                                className="bg-muted/30 p-0"
                              >
                                <div className="px-6 py-3 space-y-3">
                                  {MOCK_SALURAN_DETAIL[i] ? (
                                    MOCK_SALURAN_DETAIL[i].map((s) => (
                                      <div
                                        key={s.saluran}
                                        className="flex items-start gap-4"
                                      >
                                        {/* Saluran label + turnout */}
                                        <div className="w-24 shrink-0">
                                          <p className="text-xs font-mono font-medium">
                                            Saluran {s.saluran}
                                          </p>
                                          {s.votes_cast !== null ? (
                                            <p className="text-xs text-muted-foreground">
                                              {s.votes_cast}/{s.voters} votes
                                            </p>
                                          ) : (
                                            <p className="text-xs text-muted-foreground">
                                              {s.voters} reg.
                                            </p>
                                          )}
                                        </div>

                                        {/* Party bars or pending */}
                                        {s.status === "pending" ? (
                                          <span className="text-xs text-muted-foreground italic mt-0.5">
                                            Not yet reported
                                          </span>
                                        ) : (
                                          <div className="flex-1 space-y-1.5">
                                            {s.parties.map((p) => {
                                              const max = Math.max(
                                                ...s.parties.map(
                                                  (x) => x.votes,
                                                ),
                                              );
                                              return (
                                                <div
                                                  key={p.party}
                                                  className="flex items-center gap-2"
                                                >
                                                  <span
                                                    className={`text-xs px-1.5 py-0.5 rounded font-medium w-14 text-center shrink-0 ${getCoalitionBadge(p.coalition)}`}
                                                  >
                                                    {p.party}
                                                  </span>
                                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                      className={`h-full rounded-full transition-all duration-500 ${getCoalitionColor(p.coalition)}`}
                                                      style={{
                                                        width: `${((p.votes / max) * 100).toFixed(0)}%`,
                                                      }}
                                                    />
                                                  </div>
                                                  <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">
                                                    {p.votes}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                      No saluran detail available yet
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
