import { Badge } from "@/components/ui/badge";
import { getCoalitionBadge, getCoalitionColor } from "@/lib/coalition";
import type { LiveState } from "@/types/election";

interface Props {
  live: LiveState;
}

function StatusBadge({ status }: { status: LiveState["status"] }) {
  if (status === "before") return <Badge variant="muted">Polls not open</Badge>;
  if (status === "counting")
    return <Badge variant="warning">⚡ Counting in progress</Badge>;
  return <Badge variant="success">✓ Result declared</Badge>;
}

export function LiveSummaryStrip({ live }: Props) {
  const stats = live.stats;
  const sorted = [...live.ballot].sort((a, b) => b.votes - a.votes);
  const leader = sorted[0];
  const runner = sorted[1];
  const maxVotes = leader?.votes ?? 1;

  const swingLabel =
    live.swing2022 !== null
      ? `${live.swing2022 > 0 ? "▲" : "▼"} ${Math.abs(live.swing2022).toFixed(1)}pts vs 2022`
      : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Polling Day — 11 Jul 2026</h2>
          <StatusBadge status={live.status} />
        </div>
        <div className="flex items-center gap-3">
          {live.lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {new Date(live.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {live.saluransReported}/{live.saluransTotal} saluran across{" "}
            {live.dmsTotal} DM
          </span>
        </div>
      </div>

      {live.status === "before" && (
        <p className="text-sm text-muted-foreground">
          Polling has not started. This panel will update automatically once
          counting data is available.
        </p>
      )}

      {live.status !== "before" && stats && leader && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Turnout so far</p>
              <p className="text-xl font-semibold font-mono">
                {stats.voter_turnout.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.ballots_issued.toLocaleString()} /{" "}
                {stats.voters_total.toLocaleString()}
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Currently leading</p>
              <p className="text-base font-semibold leading-tight mt-1">
                {leader.name}
              </p>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(leader.coalition)}`}
              >
                {leader.party} · {leader.coalition}
              </span>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Lead margin</p>
              <p className="text-xl font-semibold font-mono">
                {runner ? (leader.votes - runner.votes).toLocaleString() : "—"}
              </p>
              {runner && (
                <p className="text-xs text-muted-foreground">
                  {(leader.votes_perc! - runner.votes_perc!).toFixed(1)}pts over{" "}
                  {runner.name.split(" ")[0]}
                </p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Rejected ballots</p>
              <p className="text-xl font-semibold font-mono">
                {stats.votes_rejected.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.votes_rejected_perc.toFixed(1)}% of counted
                {swingLabel && (
                  <span
                    className={`ml-2 ${live.swing2022! > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {swingLabel}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Vote bars */}
          <div className="space-y-2">
            {sorted.map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">
                    {b.name === leader.name && "▲ "}
                    {b.name}{" "}
                    <span className="text-muted-foreground">({b.party})</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {b.votes.toLocaleString()} ({b.votes_perc?.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getCoalitionColor(b.coalition)}`}
                    style={{
                      width: `${((b.votes / maxVotes) * 100).toFixed(0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
