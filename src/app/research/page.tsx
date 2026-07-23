"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ERA_COLORS } from "@/lib/coalition";
import type {
  SaluranRawRow,
  KLSeatScreen,
  PactSoloSeat,
} from "@/types/research";

import objective1Data from "@/data/research/objective1.json";
import saluranRawData from "@/data/research/saluran-raw.json";
import objective4Data from "@/data/research/objective4.json";
import {
  computeRaceBuckets,
  computeRaceCorrelation,
  computeYouthPremium,
} from "@/lib/research-aggregations";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const objective1 = objective1Data as PactSoloSeat[];
const saluranRaw = saluranRawData as SaluranRawRow[];
const objective4 = objective4Data as KLSeatScreen[];

const TABS = [
  { id: "o1", label: "01 · Pact vs Solo" },
  { id: "o2", label: "02 · Youth Targeting" },
  { id: "o3", label: "03 · Racial Shift" },
  { id: "o4", label: "04 · GE16 / KL" },
] as const;

export default function ResearchPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("o1");
  const router = useRouter();

  const youthPremium = useMemo(() => computeYouthPremium(saluranRaw), []);
  const raceBuckets = useMemo(() => computeRaceBuckets(saluranRaw), []);
  const raceCorrelation = useMemo(() => computeRaceCorrelation(saluranRaw), []);
  const pactSoloStats = useMemo(() => {
    const pact = objective1.filter((s) => s.era === "pact");
    const solo = objective1.filter((s) => s.era === "solo");
    const avg = (rows: PactSoloSeat[]) =>
      rows.length
        ? rows.reduce((sum, r) => sum + (r.voteShare ?? 0), 0) / rows.length
        : 0;
    const wonCount = (rows: PactSoloSeat[]) =>
      rows.filter((r) => r.result === "won" || r.result === "won_uncontested")
        .length;
    const depositLossCount = (rows: PactSoloSeat[]) =>
      rows.filter((r) => r.result === "lost_deposit").length;

    return {
      pactAvg: avg(pact),
      soloAvg: avg(solo),
      pactWon: wonCount(pact),
      pactTotal: pact.length,
      soloWon: wonCount(solo),
      soloTotal: solo.length,
      pactDepositLoss: depositLossCount(pact),
      soloDepositLoss: depositLossCount(solo),
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
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
              <p className="text-xs text-muted-foreground">Research</p>
              <h1 className="text-lg font-semibold">
                Breakdown of MUDA performance
              </h1>
            </div>
          </div>
          <div className="flex gap-1 border rounded-md p-1 bg-muted">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 text-xs font-medium py-2 rounded-sm transition-colors ${
                  tab === t.id
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "o1" && (
            <Card>
              <CardHeader>
                <CardTitle>Vote share by seat, pact vs solo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-sm inline-block"
                      style={{ background: ERA_COLORS.pact }}
                    />
                    Pact
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-sm inline-block"
                      style={{ background: ERA_COLORS.solo }}
                    />
                    Solo
                  </span>
                </div>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(480, objective1.length * 24)}
                >
                  <BarChart
                    data={objective1}
                    layout="vertical"
                    margin={{ top: 10, left: 110 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" unit="%" />
                    <YAxis
                      type="category"
                      dataKey="seat"
                      width={150}
                      tick={{ fontSize: 10.5 }}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${Number(value).toFixed(2)}%`,
                        "Vote share",
                      ]}
                    />
                    <Bar dataKey="voteShare">
                      {objective1.map((s, i) => (
                        <Cell key={i} fill={ERA_COLORS[s.era]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 pt-4 border-t text-sm space-y-3 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Vote share</strong> is
                    the percentage of valid votes MUDA's candidate received in
                    that seat. <strong className="text-foreground">Pact</strong>{" "}
                    covers seats contested under a PH electoral arrangement
                    (GE-15 federal seats, and Johor SE-15 seats where PH stood
                    aside for MUDA).{" "}
                    <strong className="text-foreground">Solo</strong> covers
                    every seat MUDA contested without that backing — including
                    Larkin (SE-15), the 2023 four-state expansion, and Johor
                    SE-16.
                  </p>
                  <p>
                    <strong className="text-foreground">Finding:</strong>{" "}
                    pact-backed seats averaged{" "}
                    <strong className="text-foreground">
                      {pactSoloStats.pactAvg.toFixed(2)}%
                    </strong>{" "}
                    vote share ({pactSoloStats.pactWon}/
                    {pactSoloStats.pactTotal} won,{" "}
                    {pactSoloStats.pactDepositLoss} deposit
                    {pactSoloStats.pactDepositLoss === 1 ? "" : "s"} lost) vs.{" "}
                    <strong className="text-foreground">
                      {pactSoloStats.soloAvg.toFixed(2)}%
                    </strong>{" "}
                    solo ({pactSoloStats.soloWon}/{pactSoloStats.soloTotal} won,{" "}
                    {pactSoloStats.soloDepositLoss} deposits lost). Every seat
                    MUDA has ever won came with coalition backing — no solo run
                    has cleared even the 12.5% deposit threshold on average.
                  </p>
                  <p>
                    The clearest single data point is{" "}
                    <strong className="text-foreground">Puteri Wangsa</strong>:
                    43% and a win under the pact in 2022, collapsing to 7% and a
                    lost deposit contesting solo in 2026 — the same seat, with
                    turnout actually rising, meaning this wasn't voter apathy
                    but active vote-switching away from MUDA once the pact
                    ended.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "o2" && (
            <Card>
              <CardHeader>
                <CardTitle>Youth-block saluran vs regular saluran</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={youthPremium}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="era" tick={{ fontSize: 11 }} />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="pureYouthShare"
                      name="Pure-youth saluran (≥90%)"
                      fill={ERA_COLORS.pact}
                    />
                    <Bar
                      dataKey="regularShare"
                      name="Regular saluran (≤10%)"
                      fill="#D8D3C7"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {tab === "o3" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>MUDA vote share by racial bucket</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={raceBuckets}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                      <YAxis unit="%" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="voteShare"
                        name="MUDA vote share"
                        fill={ERA_COLORS.pact}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    Correlation: racial % vs MUDA vote share, by era
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={raceCorrelation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="era" tick={{ fontSize: 11 }} />
                      <YAxis domain={[-1, 1]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="corrMalay"
                        name="corr w/ % Malay"
                        fill="#8FA6B2"
                      />
                      <Bar
                        dataKey="corrChinese"
                        name="corr w/ % Chinese"
                        fill={ERA_COLORS.pact}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {tab === "o4" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  KL seats — composition & {objective4[0]?.election ?? "GE-15"}{" "}
                  margin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objective4
                  .slice()
                  .sort((a, b) => b.pctChinese - a.pctChinese)
                  .map((s) => (
                    <div key={s.seat} className="border rounded-md p-3 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{s.seat}</span>
                        <span>{s.marginPerc?.toFixed(1) ?? "—"}pt margin</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s.pctChinese}% Chinese · {s.pctMalay}% Malay ·{" "}
                        {s.pctIndian}% Indian · won by {s.winningCoalition}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
