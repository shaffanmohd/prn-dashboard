"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TabId = "o1" | "o2" | "o3" | "o4" | "o5";

interface Tab {
  id: TabId;
  label: string;
}

interface OverallSummaryProps {
  tabs: readonly Tab[];
  onNavigate: (id: TabId) => void;
}

export default function OverallSummary({
  tabs,
  onNavigate,
}: OverallSummaryProps) {
  const getTabLabel = (id: TabId) => tabs.find((t) => t.id === id)?.label ?? id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary: what pact vs. solo has meant for MUDA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <section>
          <h3 className="font-semibold text-foreground mb-1.5">Vote share</h3>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted">
            Pact-backed seats averaged ~24% vote share (2 wins, low deposit-loss
            rate). Solo seats averaged low single digits to ~10%, with
            near-total deposit loss. Puteri Wangsa is the cleanest evidence —
            the same seat went 44.4% (pact, won) → 6.8% (solo, lost deposit).
            See{" "}
            <button
              type="button"
              onClick={() => onNavigate("o2")}
              className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70"
            >
              {getTabLabel("o2")} →
            </button>
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-1.5">Age</h3>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted">
            Under the pact, age barely predicted anything — every band sits
            near-zero correlation. Solo, a real pattern emerges: not narrowly
            &quot;young vs old,&quot; but roughly &quot;under-50 receptive, 61+
            resistant&quot; — visible in both the JHR SE-16 slate and Puteri
            Wangsa&apos;s own before/after. See{" "}
            <button
              type="button"
              onClick={() => onNavigate("o3")}
              className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70"
            >
              {getTabLabel("o3")} →
            </button>
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-1.5">Race</h3>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted">
            Under the pact, MUDA&apos;s vote was overwhelmingly a Chinese-voter
            phenomenon (r ≈ +0.93 to +0.95 with % Chinese). Once solo, that
            relationship weakens and — in Puteri Wangsa specifically —{" "}
            <strong className="text-foreground">reverses</strong> (−0.53 with %
            Chinese, +0.54 with % Malay), suggesting the pact-era Chinese
            support was largely borrowed PH-coalition-transfer vote, not an
            organic MUDA base. See{" "}
            <button
              type="button"
              onClick={() => onNavigate("o4")}
              className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70"
            >
              {getTabLabel("o4")} →
            </button>
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-1.5">
            What this means for GE16
          </h3>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted">
            A genuine pact seat is worth far more than demographic targeting
            alone. But if MUDA ends up contesting solo, the seats worth
            prioritizing look different from the pact-era playbook — less about
            Chinese-heavy composition, more about younger-skewing,
            non-elderly-heavy areas. The predictor below reflects that split.
          </p>

          {/* Nested sub-section — explains/justifies the paragraph above */}
          <div className="pl-4 mt-4">
            <h4 className="font-medium text-foreground mb-1.5 text-[13px]">
              Assumptions behind the GE16 predictor
            </h4>
            <p className="text-muted-foreground pl-4 border-l-2 border-muted mb-3">
              The tool below doesn&apos;t weight every factor equally — it leans
              on whichever factor the data actually showed mattered most, per
              mode. See{" "}
              <button
                type="button"
                onClick={() => onNavigate("o5")}
                className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70"
              >
                {getTabLabel("o5")} →
              </button>
            </p>

            <div className="pl-4 overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground border-b bg-muted/40">
                    <th className="py-2 px-3">Mode</th>
                    <th className="py-2 px-3 text-right">% Chinese</th>
                    <th className="py-2 px-3 text-right">% Malay</th>
                    <th className="py-2 px-3 text-right">% Youth</th>
                    <th className="py-2 px-3">Why</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b align-top">
                    <td className="py-2 px-3 font-medium text-foreground">
                      If pact
                    </td>
                    <td className="py-2 px-3 text-right">60%</td>
                    <td className="py-2 px-3 text-right">30%</td>
                    <td className="py-2 px-3 text-right">10%</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      % Chinese correlated with MUDA&apos;s vote share at r ≈
                      +0.93 to +0.95 across every pact-era seat — by far the
                      strongest signal found anywhere in this analysis. Age
                      barely mattered under the pact, so it gets little weight.
                    </td>
                  </tr>
                  <tr className="border-b align-top">
                    <td className="py-2 px-3 font-medium text-foreground">
                      If solo
                    </td>
                    <td className="py-2 px-3 text-right">15%</td>
                    <td className="py-2 px-3 text-right">55%</td>
                    <td className="py-2 px-3 text-right">30%</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      Once solo, % Chinese stopped predicting well — in Puteri
                      Wangsa it flipped negative (−0.53). % Malay and youth
                      (18-30) became the more reliable signals instead.
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-2 px-3 font-medium text-foreground">
                      Equal (either mode)
                    </td>
                    <td className="py-2 px-3 text-right">33%</td>
                    <td className="py-2 px-3 text-right">33%</td>
                    <td className="py-2 px-3 text-right">33%</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      A sanity check shown alongside the primary weighting. If
                      it points to a very different seat, the predictor flags
                      that disagreement as a reason to trust the result less.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground pl-4 mt-2">
              One more assumption worth stating plainly: the pact reference set
              is 12 seats, the solo reference set is smaller — both are small
              samples. This is an informed comparison against MUDA&apos;s actual
              history, not a statistical forecast with real confidence
              intervals.
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
