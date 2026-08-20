import { GE16Predictor } from "@/components/research/GE16Predictor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KLSeatScreen, PactSoloSeat, SaluranRawRow } from "@/types/research";
import objective4Data from "@/data/research/objective4.json";
import objective1Data from "@/data/research/objective1.json";
import saluranRawData from "@/data/research/saluran-raw.json";

export default function ObjectiveFour() {
  const objective4 = objective4Data as KLSeatScreen[];
  const objective1 = objective1Data as PactSoloSeat[];
  const saluranRaw = saluranRawData as SaluranRawRow[];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Summary: what pact vs. solo has meant for MUDA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Vote share:</strong> pact-backed
            seats averaged ~24% vote share (2 wins, low deposit-loss rate); solo
            seats averaged low single digits to ~10%, with near-total deposit
            loss. Puteri Wangsa is the cleanest evidence — the same seat went
            44.4% (pact, won) → 6.8% (solo, lost deposit).
          </p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Race:</strong> under the pact,
            MUDA&apos;s vote was overwhelmingly a Chinese-voter phenomenon (r ≈
            +0.93 to +0.95 with % Chinese). Once solo, that relationship weakens
            and — in Puteri Wangsa specifically —{" "}
            <strong className="text-foreground">reverses</strong> (−0.53 with %
            Chinese, +0.54 with % Malay), suggesting the pact-era Chinese
            support was largely borrowed PH-coalition-transfer vote, not an
            organic MUDA base.
          </p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Age:</strong> under the pact,
            age barely predicted anything (all bands near-zero correlation).
            Solo, a real pattern emerges — not narrowly &quot;young vs
            old,&quot; but roughly &quot;under-50 receptive, 61+ resistant&quot;
            — visible in both the JHR SE-16 slate and Puteri Wangsa&apos;s own
            before/after.
          </p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">
              What this means for GE16:
            </strong>{" "}
            a genuine pact seat is worth far more than demographic targeting
            alone — but if MUDA does end up contesting solo, the seats worth
            prioritizing look different than the pact-era playbook: less about
            Chinese-heavy composition, more about younger-skewing,
            non-elderly-heavy areas. The two predictors below reflect that
            split.
          </p>
        </CardContent>
      </Card>
      <GE16Predictor
        saluranRaw={saluranRaw}
        objective1={objective1}
        klSeats={objective4}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            KL seats — composition & {objective4[0]?.election ?? "GE-15"} margin
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
                  {s.pctChinese}% Chinese · {s.pctMalay}% Malay · {s.pctIndian}%
                  Indian · {s.pctYouth}% aged 18-30 · won by{" "}
                  {s.winningCoalition}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </>
  );
}
