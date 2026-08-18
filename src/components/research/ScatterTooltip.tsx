"use client";

interface ScatterTooltipPayload {
  seat: string;
  dm: string;
  pm: string;
  saluran: number;
  voters: number;
  mudaVoteShare: number;
  [key: string]: unknown;
}

interface ScatterTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ScatterTooltipPayload;
  }>;
  axisLabel: string;
  axisKey: string;
}

export function ScatterTooltip({
  active,
  payload,
  axisLabel,
  axisKey,
}: ScatterTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0].payload as ScatterTooltipPayload;
  const axisValue = point[axisKey] as number;
  const voteShare = point.mudaVoteShare as number;

  return (
    <div className="bg-background border rounded-md shadow-md p-2.5 text-xs space-y-1">
      <p className="font-semibold text-foreground">{point.seat}</p>
      <p className="text-muted-foreground">
        {point.dm} · Saluran #{point.saluran}
      </p>
      <p className="text-muted-foreground">{point.pm}</p>
      <div className="pt-1 border-t mt-1 space-y-0.5">
        <p>
          {axisLabel}:{" "}
          <strong className="text-foreground">
            {Number(axisValue).toFixed(1)}%
          </strong>
        </p>
        <p>
          MUDA vote share:{" "}
          <strong className="text-foreground">
            {Number(voteShare).toFixed(1)}%
          </strong>
        </p>
        <p>
          Voters: <strong className="text-foreground">{point.voters}</strong>
        </p>
      </div>
    </div>
  );
}
