import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoalitionBadge } from "@/lib/coalition";
import { HeadlineBallotRow, HeadlineStatsRow } from "@/types/election";

interface Props {
  stats: HeadlineStatsRow; // latest election stats row for this seat
  winner: HeadlineBallotRow; // rank === 1 row for latest election
}

export function StatCards({ stats, winner }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-xs text-muted-foreground">
            Incumbent (2022)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{winner.name}</p>
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-medium ${getCoalitionBadge(winner.coalition)}`}
          >
            {winner.party} · {winner.coalition}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs text-muted-foreground">
            2022 Majority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold font-mono">
            {stats.majority.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.majority_perc.toFixed(1)}% of valid votes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xs text-muted-foreground">
            2022 Turnout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold font-mono">
            {stats.voter_turnout.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.ballots_issued.toLocaleString()} voters
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
