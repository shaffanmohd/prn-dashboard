"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ERA_COLORS } from "@/lib/coalition";
import type { SaluranRawRow, KLSeatScreen } from "@/types/research";

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
import ObjectiveOne from "./components/ObjectiveOne";

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 ">
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

          {tab === "o1" && <ObjectiveOne />}

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
