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
import type { HeadlineBallotRow } from "@/types/election";

interface Props {
  ballots: HeadlineBallotRow[];
}

// Derive unique candidates from ballot rows
function getCandidates(ballots: HeadlineBallotRow[]) {
  const map = new Map<
    string,
    {
      name: string;
      party: string;
      coalition: string;
      c: number;
      w: number;
      l: number;
    }
  >();
  for (const b of ballots) {
    const existing = map.get(b.candidate_uid) ?? {
      name: b.name,
      party: b.party,
      coalition: b.coalition,
      c: 0,
      w: 0,
      l: 0,
    };
    existing.c++;
    if (b.result === "won" || b.result === "won_uncontested") existing.w++;
    else existing.l++;
    map.set(b.candidate_uid, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.w - a.w);
}

export function CandidatesCard({ ballots }: Props) {
  const candidates = getCandidates(ballots);
  const preview = candidates.slice(0, 3);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Candidates</CardTitle>
              <span className="text-xs text-blue-600">View records →</span>
            </div>
            <p className="text-xs text-muted-foreground">
              source: headline_ballots_state_jhr.csv
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                  {c.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.c} contests · {c.w} won · {c.l} lost
                  </p>
                </div>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${getCoalitionBadge(c.coalition)}`}
                >
                  {c.party}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Full contest records</DialogTitle>
          <DialogDescription>
            All candidates at this seat · source: headline_ballots_state_jhr.csv
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Election</TableHead>
              <TableHead>Party</TableHead>
              <TableHead className="text-right">Votes</TableHead>
              <TableHead className="text-right">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...ballots]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((b, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {b.election} ({b.date.slice(-4)})
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(b.coalition)}`}
                    >
                      {b.party}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {b.votes.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-xs font-medium ${b.result === "won" ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {b.result.replace("_", " ")}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
