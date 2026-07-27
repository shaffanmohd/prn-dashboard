import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  computeEraSaluranSummary,
  computeSeatSaluranBreakdown,
  computeYouthPremium,
} from "@/lib/research-aggregations";
import { SaluranRawRow } from "@/types/research";
import { useMemo } from "react";
import saluranRawData from "@/data/research/saluran-raw.json";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ERA_COLORS } from "@/lib/coalition";

export default function ObjectiveTwo() {
  const saluranRaw = saluranRawData as SaluranRawRow[];

  const youthPremium = useMemo(
    () => computeYouthPremium(saluranRaw),
    [saluranRaw],
  );
  const seatBreakdown = useMemo(
    () => computeSeatSaluranBreakdown(saluranRaw),
    [saluranRaw],
  );
  const eraSummary = useMemo(
    () => computeEraSaluranSummary(seatBreakdown),
    [seatBreakdown],
  );
  const groupedByEra = useMemo(() => {
    const map = new Map<string, typeof seatBreakdown>();
    for (const row of seatBreakdown) {
      if (!map.has(row.era)) map.set(row.era, []);
      map.get(row.era)!.push(row);
    }
    return Array.from(map.entries());
  }, [seatBreakdown]);

  const youthStats = useMemo(() => {
    const withPremium = youthPremium.map((e) => ({
      ...e,
      premium: e.pureYouthShare - e.regularShare,
    }));
    return withPremium;
  }, [youthPremium]);
  return (
    <>
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
                fill={ERA_COLORS.solo}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Number of youth and normal saluran breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-6 space-y-4">
            {groupedByEra.map(([era, seats]) => {
              const summary = eraSummary.find((e) => e.era === era);
              return (
                <div key={era}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <h4 className="text-sm font-semibold">{era}</h4>
                    <span className="text-xs text-muted-foreground">
                      Era avg:{" "}
                      <strong className="text-foreground">
                        {summary?.pctPureYouth}%
                      </strong>{" "}
                      pure-youth saluran ({summary?.totalPureYouth}/
                      {summary?.totalSaluran})
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b">
                          <th className="py-2 pr-3">Seat</th>
                          <th className="py-2 pr-3 text-right">
                            Total saluran
                          </th>
                          <th className="py-2 pr-3 text-right">
                            Pure-youth (≥90%)
                          </th>
                          <th className="py-2 pr-3 text-right">
                            Mixed (10–90%)
                          </th>
                          <th className="py-2 pr-3 text-right">
                            Regular (≤10%)
                          </th>
                          <th className="py-2 pr-3 text-right">% pure-youth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seats.map((row) => (
                          <tr
                            key={row.seat}
                            className="border-b border-muted/50"
                          >
                            <td className="py-1.5 pr-3">{row.seat}</td>
                            <td className="py-1.5 pr-3 text-right">
                              {row.totalSaluran}
                            </td>
                            <td className="py-1.5 pr-3 text-right">
                              {row.pureYouthCount}
                            </td>
                            <td className="py-1.5 pr-3 text-right">
                              {row.mixedCount}
                            </td>
                            <td className="py-1.5 pr-3 text-right">
                              {row.regularCount}
                            </td>
                            <td className="py-1.5 pr-3 text-right">
                              {row.pctPureYouth}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* explanation part */}
      <Card>
        <CardContent>
          <div className="mt-6 pt-4 border-t text-sm space-y-3 text-muted-foreground">
            <p>
              Each saluran (polling stream) is bucketed by the share of its
              registered voters aged 18 to 30.{" "}
              <strong className="text-foreground">Pure-youth saluran</strong>{" "}
              are streams where 90%+ of voters are in that age band — these are
              near-certainly separate blocs created for UNDI18 automatic voter
              registration, appended to a polling districts existing list rather
              than blended in, not a smooth demographic gradient.{" "}
              <strong className="text-foreground">Regular saluran</strong> are
              streams where 10% or fewer voters are aged 18 to 30 — i.e. the
              older, pre-existing voter base.
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
              in youth-block saluran than regular ones — a real, measurable
              youth premium. In the GE-15 federal seats (Muar, Tanjung Piai),
              that premium is close to zero, suggesting Muars win was driven
              more by Syed Saddiqs personal brand than youth turnout
              specifically. In the one seat we have for the solo era (Temiang),
              the youth premium survives in{" "}
              <strong className="text-foreground">relative</strong> terms —
              youth saluran still outperform regular ones by a similar margin —
              even though both numbers collapsed in{" "}
              <strong className="text-foreground">absolute</strong> terms
              compared to the pact era.
            </p>
            <p>
              <strong className="text-foreground">Assumptions/caveats:</strong>{" "}
              (1) the ≥90%/≤10% thresholds are a judgment call to isolate
              clearly youth-dominated vs. clearly older saluran — saluran in
              between are not counted in either bucket. (2) The pure-youth =
              UNDI18 supplementary bloc read is an inference from the pattern
              (youth share correlates strongly with saluran number within a
              district), not something confirmed directly in the data. (3) The
              solo-era figure rests on Temiang alone — a single seat with only 2
              qualifying youth-block saluran (~1,200 voters) — so treat that
              number as directional, not solid, until more solo-era saluran data
              is available.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
