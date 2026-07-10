"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Navbar } from "@/components/dashboard/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { BorangStatus, type BorangEntry } from "@/lib/notion";
import { CALON_BY_SEAT, COALITION_FIELD_MAP } from "@/data/calon";
import { getCoalitionBadge, getCoalitionColor } from "@/lib/coalition";

interface Props {
  params: Promise<{ slug: string }>;
}

const SEAT_LABELS: Record<string, string> = {
  "n15-maharani-johor": "N.15 MAHARANI",
  "n13-simpang-jeram-johor": "N.13 SIMPANG JERAM",
  "n41-puteri-wangsa-johor": "N.41 PUTERI WANGSA",
  "n51-bukit-batu-johor": "N.51 BUKIT BATU",
};

// Group entries by namaPusatMengundi
function groupByTM(entries: BorangEntry[]) {
  const map = new Map<string, BorangEntry[]>();
  for (const e of entries) {
    const key = e.namaPusatMengundi;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return map;
}

function statusBadge(status: BorangStatus) {
  if (status === BorangStatus.Done)
    return <Badge variant="success">✓ Done</Badge>;
  if (status === BorangStatus.Pending)
    return <Badge variant="warning">⏳ Pending</Badge>;
  return <Badge variant="muted">— Not started</Badge>;
}

function SummaryCards({
  entries,
  slug,
}: {
  entries: BorangEntry[];
  slug: string;
}) {
  const calon = CALON_BY_SEAT[slug] ?? [];
  const regular = entries.filter((e) => !e.isUndiAwal);
  const undiAwal = entries.filter((e) => e.isUndiAwal);

  const totalSaluran = regular.length;
  const doneSaluran = regular.filter(
    (e) => e.status === BorangStatus.Done,
  ).length;

  // Calculate totals per coalition using COALITION_FIELD_MAP
  const coalitionTotals = calon.map((c) => {
    const field = COALITION_FIELD_MAP[c.coalition];
    const total = entries.reduce(
      (s, e) => s + ((field ? e[field] : 0) as number),
      0,
    );
    return { ...c, total };
  });

  const leading = [...coalitionTotals].sort((a, b) => b.total - a.total)[0];
  const mudaTotal = coalitionTotals.find((c) => c.party === "MUDA")?.total ?? 0;
  const totalVotes = coalitionTotals.reduce((s, c) => s + c.total, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              Saluran reported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold font-mono">
              {doneSaluran}/{totalSaluran}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSaluran > 0
                ? Math.round((doneSaluran / totalSaluran) * 100)
                : 0}
              % complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              MUDA votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold font-mono text-yellow-500">
              {mudaTotal.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalVotes > 0 ? ((mudaTotal / totalVotes) * 100).toFixed(1) : 0}
              % of counted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              Currently leading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-xl font-semibold ${getCoalitionBadge(leading?.coalition ?? "")}`}
            >
              {leading?.party ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {leading?.name} · {leading?.total.toLocaleString()} undi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              Undi awal (MUDA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold font-mono text-yellow-500">
              {undiAwal.reduce((s, e) => s + e.undiMuda, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {undiAwal.length} stream{undiAwal.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Vote bars */}
      {totalVotes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground">
              Keputusan semasa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...coalitionTotals]
              .sort((a, b) => b.total - a.total)
              .map((c) => {
                const maxVotes = Math.max(
                  ...coalitionTotals.map((x) => x.total),
                );
                const isLeading = c.coalition === leading?.coalition;
                return (
                  <div key={c.coalition}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium flex items-center gap-1.5">
                        {isLeading && <span>▲</span>}
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(c.coalition)}`}
                        >
                          {c.coalition}
                        </span>
                        <span className="text-muted-foreground">{c.name}</span>
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {c.total.toLocaleString()} (
                        {totalVotes > 0
                          ? ((c.total / totalVotes) * 100).toFixed(1)
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getCoalitionColor(c.coalition)}`}
                        style={{
                          width: `${maxVotes > 0 ? ((c.total / maxVotes) * 100).toFixed(0) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UndiAwalSection({ entries }: { entries: BorangEntry[] }) {
  const undiAwal = entries.filter((e) => e.isUndiAwal);
  if (undiAwal.length === 0) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge variant="secondary">Undi Awal</Badge>
          {undiAwal.filter((e) => e.status === BorangStatus.Done).length}/
          {undiAwal.length} reported
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tempat Mengundi</TableHead>
              <TableHead>DM</TableHead>
              <TableHead className="text-center">Saluran</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">MUDA</TableHead>
              <TableHead className="text-right">BN</TableHead>
              <TableHead className="text-right">PH</TableHead>
              <TableHead className="text-right">PN</TableHead>
              <TableHead className="text-right">Tolak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {undiAwal.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs">{e.namaPusatMengundi}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {e.daerahMengundiId}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {e.saluran}
                </TableCell>
                <TableCell className="text-center">
                  {statusBadge(e.status)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {e.undiMuda || "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {e.undiBn || "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {e.undiPh || "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {e.undiPn || "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {e.undiTolak || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TMTable({ entries, slug }: { entries: BorangEntry[], slug: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const calon = CALON_BY_SEAT[slug] ?? [];
  const regular = entries.filter((e) => !e.isUndiAwal);
  const grouped = groupByTM(regular);
  const tmList = Array.from(grouped.entries());

  const uniqueCoalitions = calon.filter(
    (c, i, arr) => arr.findIndex((x) => x.coalition === c.coalition) === i
  );

  function getVotes(entry: BorangEntry, coalition: string): number {
    const field = COALITION_FIELD_MAP[coalition];
    return field ? (entry[field] as number) : 0;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Tempat Mengundi
          </CardTitle>
          <span className="text-xs text-muted-foreground">{tmList.length} pusat mengundi</span>
        </div>
        <p className="text-xs text-muted-foreground">Click any row to see per-saluran detail</p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tempat Mengundi</TableHead>
              <TableHead>DM</TableHead>
              <TableHead className="text-center">Saluran</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {uniqueCoalitions.map((c) => (
                <TableHead key={c.coalition} className="text-right">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(c.coalition)}`}>
                    {c.coalition}
                  </span>
                </TableHead>
              ))}
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tmList.map(([tm, tmEntries]) => {
              const done = tmEntries.filter((e) => e.status === BorangStatus.Done).length;
              const total = tmEntries.length;
              const isExpanded = expanded === tm;
              const dmId = tmEntries[0].daerahMengundiId;
              const jumlah = tmEntries.reduce((s, e) => s + e.jumlahUndiPemilih, 0);

              // Find winning coalition for this TM
              const coalitionVotes = uniqueCoalitions.map((c) => ({
                coalition: c.coalition,
                votes: tmEntries.reduce((s, e) => s + getVotes(e, c.coalition), 0),
              }));
              const maxTMVotes = Math.max(...coalitionVotes.map((c) => c.votes));
              const winner = coalitionVotes.find((c) => c.votes === maxTMVotes && c.votes > 0);

              return (
                <>
                  <TableRow
                    key={tm}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : tm)}
                  >
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`transition-transform duration-200 text-muted-foreground text-xs ${isExpanded ? "rotate-90" : ""}`}>›</span>
                        {tm}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{dmId}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{done}/{total}</TableCell>
                    <TableCell className="text-center">
                      {done === total && total > 0
                        ? <Badge variant="success">✓ Done</Badge>
                        : done > 0
                        ? <Badge variant="warning">⏳ {Math.round((done / total) * 100)}%</Badge>
                        : <Badge variant="muted">—</Badge>
                      }
                    </TableCell>
                    {uniqueCoalitions.map((c) => {
                      const votes = tmEntries.reduce((s, e) => s + getVotes(e, c.coalition), 0);
                      const isWinner = winner?.coalition === c.coalition;
                      return (
                        <TableCell key={c.coalition} className="text-right font-mono text-sm">
                          {votes > 0 ? (
                            <span className={isWinner
                              ? `px-1.5 py-0.5 rounded font-bold ${getCoalitionBadge(c.coalition)}`
                              : ""
                            }>
                              {votes.toLocaleString()}
                            </span>
                          ) : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {jumlah > 0 ? jumlah.toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>

                  {/* Accordion */}
                  {isExpanded && (
                    <TableRow key={`${tm}-expanded`} className="accordion-open">
                      <TableCell colSpan={5 + uniqueCoalitions.length} className="bg-muted/30 p-0">
                        <div className="px-4 py-3">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs">Saluran</TableHead>
                                <TableHead className="text-xs text-center">Status</TableHead>
                                {uniqueCoalitions.map((c) => (
                                  <TableHead key={c.coalition} className="text-right text-xs">
                                    <span className={`px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(c.coalition)}`}>
                                      {c.coalition}
                                    </span>
                                  </TableHead>
                                ))}
                                <TableHead className="text-right text-xs">Jumlah</TableHead>
                                <TableHead className="text-right text-xs">Tolak</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tmEntries.map((e) => {
                                const saluranCoalitionVotes = uniqueCoalitions.map((c) => ({
                                  coalition: c.coalition,
                                  votes: getVotes(e, c.coalition),
                                }));
                                const maxSaluranVotes = Math.max(...saluranCoalitionVotes.map((c) => c.votes));
                                const saluranWinner = saluranCoalitionVotes.find(
                                  (c) => c.votes === maxSaluranVotes && c.votes > 0
                                );

                                return (
                                  <TableRow key={e.id}>
                                    <TableCell className="font-mono text-xs font-medium">
                                      {e.saluran}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {statusBadge(e.status)}
                                    </TableCell>
                                    {uniqueCoalitions.map((c) => {
                                      const votes = getVotes(e, c.coalition);
                                      const isWinner = saluranWinner?.coalition === c.coalition;
                                      return (
                                        <TableCell key={c.coalition} className="text-right font-mono text-sm">
                                          {e.status === BorangStatus.NotStarted ? (
                                            <span className="text-muted-foreground">—</span>
                                          ) : (
                                            <span className={isWinner
                                              ? `px-1.5 py-0.5 rounded font-bold ${getCoalitionBadge(c.coalition)}`
                                              : votes === 0 ? "text-muted-foreground" : ""
                                            }>
                                              {votes > 0 ? votes.toLocaleString() : "0"}
                                            </span>
                                          )}
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                                      {e.status === BorangStatus.NotStarted ? "—" : e.jumlahUndiPemilih.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                                      {e.status === BorangStatus.NotStarted ? "—" : e.undiTolak > 0 ? e.undiTolak : "0"}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function GroundOpsPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const seatLabel = SEAT_LABELS[slug] ?? slug;

  const [entries, setEntries] = useState<BorangEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/ground-ops/${slug}`);
      const data = (await res.json()) as { entries: BorangEntry[] };
      setEntries(data.entries);
      setLastUpdated(new Date());
      setCountdown(60);
    } catch (err) {
      console.error("Failed to fetch ground ops data:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Initial fetch on mount
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/ground-ops/${slug}`);
        const data = (await res.json()) as { entries: BorangEntry[] };
        if (!cancelled) {
          setEntries(data.entries);
          setLastUpdated(new Date());
          setCountdown(60);
        }
      } catch (err) {
        console.error("Failed to fetch ground ops data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Poll every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 60 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
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
              <div>
                <p className="text-xs text-muted-foreground">
                  Ground ops — internal
                </p>
                <h1 className="text-lg font-semibold">{seatLabel}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                  <span className="text-muted-foreground/50">
                    · refresh in {countdown}s
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchData()}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : (
            <>
              <SummaryCards entries={entries} slug={slug} />
              <UndiAwalSection entries={entries} />
              <TMTable entries={entries} slug={slug} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
