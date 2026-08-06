import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ERA_COLORS } from "@/lib/coalition";
import { computeRaceCorrelation } from "@/lib/research-aggregations";
import { SaluranRawRow } from "@/types/research";
import { useMemo } from "react";
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
import saluranRawData from "@/data/research/saluran-raw.json";
import { computeRaceByEra } from "@/lib/research-aggregations";

export default function ObjectiveThree() {
  const saluranRaw = saluranRawData as SaluranRawRow[];

  const raceCorrelation = useMemo(
    () => computeRaceCorrelation(saluranRaw),
    [saluranRaw],
  );
  const raceByEra = useMemo(() => computeRaceByEra(saluranRaw), [saluranRaw]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>MUDA vote share by racial bucket</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={raceByEra}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="era" tick={{ fontSize: 10.5 }} />
              <YAxis unit="%" />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, ""]}
              />
              <Legend />
              <Bar
                dataKey="chinese"
                name="Chinese-majority saluran"
                fill={ERA_COLORS.pact}
              />
              <Bar
                dataKey="malay"
                name="Malay-majority saluran"
                fill="#8FA6B2"
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-4">
            Each bar is the voter-weighted average MUDA vote share across
            saluran where one race makes up a majority (≥60% Malay or ≥40%
            Chinese — thresholds chosen to capture clearly-dominant, not just
            plurality, composition).
          </p>

          <div className="mt-4 p-4 border rounded-md bg-muted/30 text-sm space-y-3">
            <p className="font-semibold text-foreground">Conclusion</p>
            <p className="text-muted-foreground">
              Under the pact (GE-15, JHR SE-15), MUDA&apos;s vote is
              overwhelmingly a Chinese-voter phenomenon — Chinese-majority
              saluran gave MUDA 50-58% vs. 8-15% in Malay-majority saluran, and
              this holds even at Larkin (solo, but still Chinese-leaning: +0.93
              correlation) — meaning the Chinese-vote pattern isn&apos;t
              actually about the pact itself, it&apos;s about MUDA&apos;s appeal
              specifically in Chinese-heavy Johor seats regardless of coalition
              status. The pattern only breaks at Temiang (N9, solo), where it
              flips — Malay-majority saluran outperform Chinese ones there.
              That&apos;s the one seat suggesting the Chinese-transfer-vote
              theory might hold outside Johor, but it&apos;s a single seat, thin
              sample — worth treating as a lead, not a conclusion, until more
              solo-era Chinese-heavy seats are tested.
            </p>
          </div>
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
              <Tooltip formatter={(value) => [Number(value).toFixed(2), ""]} />
              <Legend />
              <Bar dataKey="corrMalay" name="corr w/ % Malay" fill="#8FA6B2" />
              <Bar
                dataKey="corrChinese"
                name="corr w/ % Chinese"
                fill={ERA_COLORS.pact}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-4">
            Each bar is a Pearson correlation coefficient (r) between a
            saluran&apos;s racial composition and MUDA&apos;s vote share there —
            using every saluran in that era, not just clearly majority-Chinese
            or majority-Malay ones. +1 means the relationship is perfectly
            consistent (more of that race = more MUDA vote, every time); 0 means
            no relationship; −1 means perfectly inverse.
          </p>

          <div className="mt-4 p-4 border rounded-md bg-muted/30 text-sm space-y-3">
            <p className="font-semibold text-foreground">Conclusion</p>
            <p className="text-muted-foreground">
              The Chinese correlation is strongly positive in every pact and
              Larkin-solo era (+0.93 to +0.95) — remarkably consistent
              regardless of pact status, which confirms Chart 1: this isn&apos;t
              a coincidence of a few outlier saluran, it&apos;s a strong,
              reliable pattern across each entire seat. The Malay correlation
              tells the more interesting story: strongly negative under the
              Johor pact and at Larkin (−0.92 to −0.94), only weakly negative at
              the GE-15 federal level (−0.23), and{" "}
              <strong className="text-foreground">
                flips fully positive at Temiang
              </strong>{" "}
              (+0.90) — the only era where being Malay-majority actually helped
              MUDA rather than hurt it. That flip at Temiang is the strongest
              single piece of evidence that MUDA&apos;s support base looks
              structurally different outside Johor, though again — one seat,
              worth confirming rather than treating as settled.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
