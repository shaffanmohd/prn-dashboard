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
  const youthStats = useMemo(() => {
    const withPremium = youthPremium.map((e) => ({
      ...e,
      premium: e.pureYouthShare - e.regularShare,
    }));
    return withPremium;
  }, [youthPremium]);

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
                <div className="mt-6 pt-4 border-t text-sm space-y-3 text-muted-foreground">
                  <p>
                    Each saluran (polling stream) is bucketed by the share of
                    its registered voters aged 18–30.{" "}
                    <strong className="text-foreground">
                      Pure-youth saluran
                    </strong>{" "}
                    are streams where 90%+ of voters are in that age band —
                    these are near-certainly separate blocs created for UNDI18
                    automatic voter registration, appended to a polling
                    district's existing list rather than blended in, not a
                    smooth demographic gradient.{" "}
                    <strong className="text-foreground">Regular saluran</strong>{" "}
                    are streams where 10% or fewer voters are aged 18–30 — i.e.
                    the older, pre-existing voter base.
                  </p>
                  <p>
                    <strong className="text-foreground">Finding:</strong> in the
                    pact-backed Johor DUN seats, MUDA won{" "}
                    <strong className="text-foreground">
                      {youthStats
                        .find((e) => e.era === "Pact - JHR SE15")
                        ?.premium.toFixed(1)}
                      pts more
                    </strong>{" "}
                    in youth-block saluran than regular ones — a real,
                    measurable youth premium. In the GE-15 federal seats (Muar,
                    Tanjung Piai), that premium is close to zero, suggesting
                    Muar's win was driven more by Syed Saddiq's personal brand
                    than youth turnout specifically. In the one seat we have for
                    the solo era (Temiang), the youth premium survives in{" "}
                    <strong className="text-foreground">relative</strong> terms
                    — youth saluran still outperform regular ones by a similar
                    margin — even though both numbers collapsed in{" "}
                    <strong className="text-foreground">absolute</strong> terms
                    compared to the pact era.
                  </p>
                  <p>
                    <strong className="text-foreground">
                      Assumptions/caveats:
                    </strong>{" "}
                    (1) the ≥90%/≤10% thresholds are a judgment call to isolate
                    clearly youth-dominated vs. clearly older saluran — saluran
                    in between aren't counted in either bucket. (2) The
                    "pure-youth = UNDI18 supplementary bloc" read is an
                    inference from the pattern (youth share correlates strongly
                    with saluran number within a district), not something
                    confirmed directly in the data. (3) The solo-era figure
                    rests on Temiang alone — a single seat with only 2
                    qualifying youth-block saluran (~1,200 voters) — so treat
                    that number as directional, not solid, until more solo-era
                    saluran data is available.
                  </p>
                </div>
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
