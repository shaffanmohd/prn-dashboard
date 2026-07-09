import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LiveState } from "@/types/election";

interface Props {
  live: LiveState;
}

export function SaluranProgressBar({ live }: Props) {
  const pct =
    live.saluransTotal > 0
      ? Math.round((live.saluransReported / live.saluransTotal) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Count progress</CardTitle>
          <span className="text-sm font-mono font-semibold">{pct}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main progress bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">{live.saluransReported}</strong>{" "}
            of <strong className="text-foreground">{live.saluransTotal}</strong>{" "}
            saluran reported
          </span>
          <span>
            across <strong className="text-foreground">{live.dmsTotal}</strong>{" "}
            Daerah Mengundi
          </span>
        </div>

        {/* DM breakdown — placeholder until saluran file confirmed live */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground italic">
            Per-DM saluran breakdown will appear here once SE-16 saluran data is
            confirmed live on polling day.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
