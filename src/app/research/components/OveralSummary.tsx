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
            When MUDA had a pact with PH, they averaged about 24% of the vote
            and won 2 seats. Running solo, they dropped to low single digits,
            sometimes up to 10%, and lost their deposit almost every time. The
            clearest proof is Puteri Wangsa — the exact same seat went from
            44.4% (with a pact, won) to 6.8% (solo, lost the deposit).{" "}
            <button
              type="button"
              onClick={() => onNavigate("o2")}
              className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70"
            >
              See {getTabLabel("o2")} →
            </button>
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-1.5">Age</h3>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted">
            With a pact, a voter&apos;s age barely made any difference to how
            MUDA did — young or old areas performed about the same. Once solo,
            age actually started to matter: MUDA did better in areas with more
            voters under 50, and consistently worse in areas with more voters
            aged 61 and up. This shows up both across the recent Johor
            by-elections and in Puteri Wangsa&apos;s own before/after
            comparison.{" "}
            <button
              type="button"
              onClick={() => onNavigate("o3")}
              className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70"
            >
              See {getTabLabel("o3")} →
            </button>
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-1.5">Race</h3>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted">
            Under the pact, MUDA&apos;s votes came mostly from Chinese voters —
            areas with more Chinese voters almost always gave MUDA a much higher
            share (this held true 93-95% of the time). Once solo, that link got
            weaker, and in Puteri Wangsa it actually{" "}
            <strong className="text-foreground">flipped</strong> — Chinese areas
            voted MUDA less, Malay areas voted MUDA slightly more. This suggests
            MUDA&apos;s Chinese support under the pact wasn&apos;t really
            &quot;theirs&quot; — it was borrowed from PH, and it left once the
            pact did.{" "}
            <button
              type="button"
              onClick={() => onNavigate("o4")}
              className="text-foreground font-semibold underline underline-offset-2 hover:opacity-70"
            >
              See {getTabLabel("o4")} →
            </button>
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-1.5">
            What this means for GE16
          </h3>
          <p className="text-muted-foreground pl-4 border-l-2 border-muted">
            Getting a real pact is worth far more than picking the
            &quot;right&quot; seat based on demographics alone. But if MUDA does
            end up running solo, the seats worth going for look different from
            the pact playbook — less about how many Chinese voters are there,
            more about whether the area skews younger and has fewer elderly
            voters. The predictor below reflects that.
          </p>

          <div className="pl-4 mt-4">
            <h4 className="font-medium text-foreground mb-1.5 text-[13px]">
              How the GE16 predictor decides what matters
            </h4>
            <p className="text-muted-foreground pl-4 border-l-2 border-muted mb-3">
              The tool below doesn&apos;t treat race and age equally — it leans
              harder on whichever factor actually predicted results best,
              depending on whether you&apos;re checking a pact scenario or a
              solo one.
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
                      % Chinese was the strongest single predictor of how well
                      MUDA did in every pact-era seat we have data for. Age made
                      almost no difference under the pact, so it barely counts
                      here.
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
                      Once solo, % Chinese stopped being useful — in Puteri
                      Wangsa it actually predicted the wrong direction. % Malay
                      and youth turned out to matter more, so they&apos;re
                      weighted higher here.
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
                      Shown as a second opinion next to the main result — it
                      doesn&apos;t assume any one factor matters most. If it
                      points to a totally different seat, that&apos;s a sign to
                      trust the result less.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground pl-4 mt-2">
              Worth being upfront: this is only based on 12 pact seats and even
              fewer solo seats — small numbers either way. Think of this as
              &quot;here&apos;s what happened in the closest real seats we
              have,&quot; not a confident forecast.
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
