"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { computeSeatProfiles, predictSeat } from "@/lib/research-aggregations";
import type { SaluranRawRow, PactSoloSeat } from "@/types/research";
import { SeatCombobox } from "@/components/research/SeatCombobox";
import type { KLSeatScreen } from "@/types/research";

interface GE16PredictorProps {
  saluranRaw: SaluranRawRow[];
  objective1: PactSoloSeat[];
  klSeats: KLSeatScreen[];
}

export function GE16Predictor({
  saluranRaw,
  objective1,
  klSeats,
}: GE16PredictorProps) {
  const seatProfiles = useMemo(
    () => computeSeatProfiles(saluranRaw, objective1),
    [saluranRaw, objective1],
  );

  const [pctChinese, setPctChinese] = useState("25");
  const [pctMalay, setPctMalay] = useState("60");
  const [pctYouth, setPctYouth] = useState("25");
  const [result, setResult] = useState<
    NonNullable<ReturnType<typeof predictSeat>>[] | null
  >(null);

  const handlePredict = () => {
    const target = {
      pctChinese: Number(pctChinese),
      pctMalay: Number(pctMalay),
      pctYouth: Number(pctYouth),
    };
    const chineseWeighted = predictSeat(
      target,
      seatProfiles,
      "chinese-weighted",
    );
    const equal = predictSeat(target, seatProfiles, "equal");
    if (!chineseWeighted || !equal) {
      setResult(null);
      return;
    }
    setResult([chineseWeighted, equal]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          GE16 seat predictor — if MUDA gets a genuine pact seat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Enter a candidate seat&apos;s demographics. This finds the most
          similar historical pact-era seat (out of {seatProfiles.length} seats
          MUDA has actually contested under a pact) and estimates a plausible
          vote share range from what happened there — it is{" "}
          <strong className="text-foreground">not</strong> a statistical
          forecast. With only {seatProfiles.length} historical seats, treat this
          as an informed comparison, not a prediction with real confidence
          intervals.
        </p>
        <SeatCombobox
          seats={klSeats}
          onSelect={(seat) => {
            setPctChinese(String(seat.pctChinese));
            setPctMalay(String(seat.pctMalay));
            setPctYouth(String(seat.pctYouth));
          }}
        />
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">% Chinese</Label>
            <Input
              value={pctChinese}
              onChange={(e) => setPctChinese(e.target.value)}
              type="number"
            />
          </div>
          <div>
            <Label className="text-xs">% Malay</Label>
            <Input
              value={pctMalay}
              onChange={(e) => setPctMalay(e.target.value)}
              type="number"
            />
          </div>
          <div>
            <Label className="text-xs">% aged 18-30</Label>
            <Input
              value={pctYouth}
              onChange={(e) => setPctYouth(e.target.value)}
              type="number"
            />
          </div>
        </div>
        <Button size="sm" onClick={handlePredict}>
          Predict
        </Button>

        {result && (
          <div className="space-y-4 pt-2">
            {result.map((r) => (
              <div key={r.weighting} className="border rounded-md p-3">
                <p className="text-xs font-semibold mb-1">
                  {r.weighting === "chinese-weighted"
                    ? "Chinese-weighted (per Objective 3's correlation findings)"
                    : "Equal weighting (no assumptions)"}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {r.weighting === "chinese-weighted"
                    ? "Finds the closest historical seat by prioritizing % Chinese match (60% of the comparison), since Objective 3 found that factor predicts MUDA's performance far more reliably than the others."
                    : "Finds the closest historical seat by weighing % Chinese, % Malay, and % youth equally (33% each) — a sanity check that doesn't assume any one factor matters more."}
                </p>
                <p className="text-sm mb-2">
                  Predicted vote share:{" "}
                  <strong className="text-foreground">
                    {r.predictedVoteShare.toFixed(2)}%
                  </strong>
                  {" — "}
                  {r.wouldBeCompetitive
                    ? "in range with MUDA's only two pact-era wins (38%, 43-44%) — could be competitive if the pact is genuine, not a token seat."
                    : "below MUDA's historical winning range — likely lost, similar to most pact-era seats."}
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  Nearest historical seats (lower distance = more similar
                  demographics to what you entered):
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-1 pr-2">Seat</th>
                      <th className="py-1 pr-2 text-right">Distance</th>
                      <th className="py-1 pr-2 text-right">
                        Actual vote share
                      </th>
                      <th className="py-1 pr-2">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.nearest.map((n) => (
                      <tr key={n.seat} className="border-b border-muted/50">
                        <td className="py-1 pr-2">{n.seat}</td>
                        <td className="py-1 pr-2 text-right">{n.distance}</td>
                        <td className="py-1 pr-2 text-right">
                          {n.voteShare.toFixed(2)}%
                        </td>
                        <td className="py-1 pr-2">{n.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {result[0].nearest[0]?.seat !== result[1].nearest[0]?.seat && (
              <p className="text-xs text-amber-700">
                ⚠ The two weightings disagree on the closest match — treat this
                prediction with extra caution, it&apos;s sensitive to the
                weighting assumption.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
