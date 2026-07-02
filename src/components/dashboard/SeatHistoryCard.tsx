import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCoalitionBadge } from "@/lib/coalition";
import type { HeadlineBallotRow, HeadlineStatsRow } from "@/types/election";

interface Props {
  ballots: HeadlineBallotRow[];
  stats: HeadlineStatsRow[];
}

// Get unique elections sorted by date descending
function getElections(stats: HeadlineStatsRow[]) {
  return [...stats].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function ElectionTable({
  ballots,
  stats,
}: {
  ballots: HeadlineBallotRow[];
  stats: HeadlineStatsRow[];
}) {
  const elections = getElections(stats);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Election</TableHead>
          <TableHead>Winner</TableHead>
          <TableHead className="text-right">Majority %</TableHead>
          <TableHead className="text-right">Turnout %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {elections.map((s, i) => {
          const winner = ballots.find(
            (b) => b.election === s.election && b.rank === 1,
          );
          return (
            <TableRow key={i}>
              <TableCell>
                <span className="font-medium">{s.election}</span>
                <span className="text-muted-foreground text-xs ml-1">
                  ({s.date.slice(-4)})
                </span>
              </TableCell>
              <TableCell>
                {winner ? (
                  <>
                    <span>{winner.name}</span>
                    <span
                      className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(winner.coalition)}`}
                    >
                      {winner.party}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {s.majority_perc.toFixed(1)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {s.voter_turnout.toFixed(1)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function SeatHistoryCard({ ballots, stats }: Props) {
  const preview = getElections(stats).slice(0, 3);
  const previewStats = stats.filter((s) =>
    preview.some((p) => p.election === s.election),
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Seat history</CardTitle>
              <span className="text-xs text-blue-600">View full →</span>
            </div>
            <p className="text-xs text-muted-foreground">
              source: headline_stats_state_jhr.csv
            </p>
          </CardHeader>
          <CardContent>
            <ElectionTable ballots={ballots} stats={previewStats} />
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Full seat history</DialogTitle>
          <DialogDescription>
            All elections for this seat · source: headline_stats_state_jhr.csv
          </DialogDescription>
        </DialogHeader>
        <ElectionTable ballots={ballots} stats={stats} />
      </DialogContent>
    </Dialog>
  );
}
