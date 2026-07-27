import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeYouthPremium } from "@/lib/research-aggregations";
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

  const youthStats = useMemo(() => {
    const withPremium = youthPremium.map((e) => ({
      ...e,
      premium: e.pureYouthShare - e.regularShare,
    }));
    return withPremium;
  }, [youthPremium]);
  return (
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
        <div className="mt-6 pt-4 border-t text-sm space-y-3 text-muted-foreground">
          <p>
            Each saluran (polling stream) is bucketed by the share of its
            registered voters aged 18 to 30.{" "}
            <strong className="text-foreground">Pure-youth saluran</strong> are
            streams where 90%+ of voters are in that age band — these are
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
            in youth-block saluran than regular ones — a real, measurable youth
            premium. In the GE-15 federal seats (Muar, Tanjung Piai), that
            premium is close to zero, suggesting Muars win was driven more by
            Syed Saddiqs personal brand than youth turnout specifically. In the
            one seat we have for the solo era (Temiang), the youth premium
            survives in <strong className="text-foreground">relative</strong>{" "}
            terms — youth saluran still outperform regular ones by a similar
            margin — even though both numbers collapsed in{" "}
            <strong className="text-foreground">absolute</strong> terms compared
            to the pact era.
          </p>
          <p>
            <strong className="text-foreground">Assumptions/caveats:</strong>{" "}
            (1) the ≥90%/≤10% thresholds are a judgment call to isolate clearly
            youth-dominated vs. clearly older saluran — saluran in between are
            not counted in either bucket. (2) The pure-youth = UNDI18
            supplementary bloc read is an inference from the pattern (youth
            share correlates strongly with saluran number within a district),
            not something confirmed directly in the data. (3) The solo-era
            figure rests on Temiang alone — a single seat with only 2 qualifying
            youth-block saluran (~1,200 voters) — so treat that number as
            directional, not solid, until more solo-era saluran data is
            available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
