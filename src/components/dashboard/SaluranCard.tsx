"use client";

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
import { Badge } from "@/components/ui/badge";
import { getCoalitionBadge, getCoalitionColor } from "@/lib/coalition";
import type { SaluranBallotRow } from "@/types/election";

interface Props {
  rows: SaluranBallotRow[];
}

// Group raw rows into { dm -> { saluran -> { party -> votes } } }
function groupByDmSaluran(rows: SaluranBallotRow[]) {
  const map = new Map<
    string,
    Map<
      string,
      { pm: string; parties: Map<string, { coalition: string; votes: number }> }
    >
  >();

  for (const row of rows) {
    if (!map.has(row.dm)) map.set(row.dm, new Map());
    const dmMap = map.get(row.dm)!;

    if (!dmMap.has(row.saluran))
      dmMap.set(row.saluran, { pm: row.pm, parties: new Map() });
    const saluranData = dmMap.get(row.saluran)!;

    saluranData.parties.set(row.party, {
      coalition: row.coalition,
      votes: (saluranData.parties.get(row.party)?.votes ?? 0) + row.votes,
    });
  }

  return map;
}

// Get all unique parties across all rows
function getParties(rows: SaluranBallotRow[]) {
  const map = new Map<string, string>(); // party -> coalition
  for (const r of rows) map.set(r.party, r.coalition);
  return Array.from(map.entries());
}

export function SaluranCard({ rows }: Props) {
  const grouped = groupByDmSaluran(rows);
  const parties = getParties(rows);
  const dmList = Array.from(grouped.entries());

  // Guard — no data yet
  if (dmList.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Saluran breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">
            No saluran data available for this seat
          </p>
        </CardHeader>
      </Card>
    );
  }

  // Preview: first DM only, max 3 salurans
  const [previewDm, previewSalurans] = dmList[0];
  const previewRows = Array.from(previewSalurans.entries()).slice(0, 3);

  function SaluranTable({
    dm,
    saluranMap,
  }: {
    dm: string;
    saluranMap: Map<
      string,
      { pm: string; parties: Map<string, { coalition: string; votes: number }> }
    >;
  }) {
    return (
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {dm}
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Saluran</TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Pusat Mengundi
              </TableHead>
              {parties.map(([party, coalition]) => (
                <TableHead key={party} className="text-right">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(coalition)}`}
                  >
                    {party}
                  </span>
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(saluranMap.entries()).map(([saluran, data]) => {
              const total = Array.from(data.parties.values()).reduce(
                (s, p) => s + p.votes,
                0,
              );
              const maxVotes = Math.max(
                ...Array.from(data.parties.values()).map((p) => p.votes),
              );
              const winner = Array.from(data.parties.entries()).find(
                ([, p]) => p.votes === maxVotes,
              );

              return (
                <TableRow key={saluran}>
                  <TableCell className="font-mono text-sm font-medium">
                    {saluran}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {data.pm}
                  </TableCell>
                  {parties.map(([party]) => {
                    const p = data.parties.get(party);
                    const isWinner = winner?.[0] === party;
                    return (
                      <TableCell
                        key={party}
                        className="text-right font-mono text-sm"
                      >
                        <span
                          className={
                            isWinner ? "font-semibold" : "text-muted-foreground"
                          }
                        >
                          {p ? p.votes.toLocaleString() : "—"}
                        </span>
                        {p && total > 0 && (
                          <div className="h-1 mt-1 bg-muted rounded-full overflow-hidden w-12 ml-auto">
                            <div
                              className={`h-full rounded-full ${getCoalitionColor(p.coalition)}`}
                              style={{
                                width: `${((p.votes / maxVotes) * 100).toFixed(0)}%`,
                              }}
                            />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right font-mono text-sm text-muted-foreground">
                    {total.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Saluran breakdown</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {rows.length} streams
                </Badge>
                <span className="text-xs text-blue-600">View all →</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {dmList.length} Daerah Mengundi · source: lake.electiondata.my
            </p>
          </CardHeader>
          <CardContent>
            {/* Preview: first DM, first 3 salurans */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {previewDm} (preview)
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Saluran</TableHead>
                  {parties.map(([party, coalition]) => (
                    <TableHead key={party} className="text-right">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${getCoalitionBadge(coalition)}`}
                      >
                        {party}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map(([saluran, data]) => (
                  <TableRow key={saluran}>
                    <TableCell className="font-mono text-sm">
                      {saluran}
                    </TableCell>
                    {parties.map(([party]) => {
                      const p = data.parties.get(party);
                      return (
                        <TableCell
                          key={party}
                          className="text-right font-mono text-sm"
                        >
                          {p ? p.votes.toLocaleString() : "—"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {dmList.length > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                + {dmList.length - 1} more DM{dmList.length > 2 ? "s" : ""} —
                click to expand
              </p>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saluran breakdown — all DMs</DialogTitle>
          <DialogDescription>
            Per-saluran vote counts by Daerah Mengundi · source:
            lake.electiondata.my
          </DialogDescription>
        </DialogHeader>
        {dmList.map(([dm, saluranMap]) => (
          <SaluranTable key={dm} dm={dm} saluranMap={saluranMap} />
        ))}
      </DialogContent>
    </Dialog>
  );
}
