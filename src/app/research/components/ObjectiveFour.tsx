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
