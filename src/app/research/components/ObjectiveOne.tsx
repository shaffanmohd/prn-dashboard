import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { ERA_COLORS } from "@/lib/coalition";
import { PactSoloSeat } from "@/types/research";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import objective1Data from "@/data/research/objective1.json";

export default function ObjectiveOne() {
  const objective1 = objective1Data as PactSoloSeat[];
  const objective1WithKey = useMemo(
    () =>
      objective1.map((s, i) => ({
        ...s,
        uid: `${s.seat}|||${s.era}|||${i}`,
      })),
    [objective1],
  );

  function seatFromUid(uid: string) {
    return uid.split("|||")[0];
  }

  const pactSoloStats = useMemo(() => {
    const pact = objective1.filter((s) => s.era === "pact");
    const solo = objective1.filter((s) => s.era === "solo");
    const avg = (rows: PactSoloSeat[]) =>
      rows.length
        ? rows.reduce((sum, r) => sum + (r.voteShare ?? 0), 0) / rows.length
        : 0;
    const wonCount = (rows: PactSoloSeat[]) =>
      rows.filter((r) => r.result === "won" || r.result === "won_uncontested")
        .length;
    const depositLossCount = (rows: PactSoloSeat[]) =>
      rows.filter((r) => r.result === "lost_deposit").length;

    return {
      pactAvg: avg(pact),
      soloAvg: avg(solo),
      pactWon: wonCount(pact),
      pactTotal: pact.length,
      soloWon: wonCount(solo),
      soloTotal: solo.length,
      pactDepositLoss: depositLossCount(pact),
      soloDepositLoss: depositLossCount(solo),
    };
  }, [objective1]);

  function truncateSeatName(seat: string, maxLength: number) {
    return seat.length > maxLength ? `${seat.slice(0, maxLength - 1)}…` : seat;
  }
  function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < breakpoint);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, [breakpoint]);
    return isMobile;
  }
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vote share by seat, pact vs solo</CardTitle>
      </CardHeader>
      <CardContent
      // className="flex flex-col"
      >
        <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ background: ERA_COLORS.pact }}
            />
            Pact
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ background: ERA_COLORS.solo }}
            />
            Solo
          </span>
        </div>
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
          <span className="w-4 border-t-2 border-dashed border-black inline-block" />
          12.5% — minimum vote share to avoid losing the election deposit
        </div>
        <ResponsiveContainer
          width="100%"
          height={Math.max(480, objective1.length * 24)}
        >
          <BarChart
            data={objective1WithKey}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <ReferenceLine
              x={12.5}
              stroke="#000000"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              label={{
                value: "12.5%",
                position: "bottom",
                fill: "#000000",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            <XAxis type="number" unit="%" />
            <YAxis
              type="category"
              dataKey="uid"
              width={isMobile ? 100 : 220}
              tick={{ fontSize: isMobile ? 10 : 11 }}
              interval={0}
              tickFormatter={(value) =>
                isMobile
                  ? truncateSeatName(seatFromUid(value), 14)
                  : seatFromUid(value)
              }
            />
            <Tooltip
              labelFormatter={(label) => seatFromUid(String(label))}
              formatter={(value) => [
                `${Number(value).toFixed(2)}%`,
                "Vote share",
              ]}
            />
            <Bar dataKey="voteShare">
              {objective1.map((s, i) => (
                <Cell key={i} fill={ERA_COLORS[s.era]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 pt-4 border-t text-sm space-y-3 text-muted-foreground">
          <p>
            <strong className="text-foreground">Vote share</strong> is the
            percentage of valid votes MUDAs candidate received in that seat.{" "}
            <strong className="text-foreground">Pact</strong> covers seats
            contested under a PH electoral arrangement (GE-15 federal seats, and
            Johor SE-15 seats where PH stood aside for MUDA).{" "}
            <strong className="text-foreground">Solo</strong> covers every seat
            MUDA contested without that backing — including Larkin (SE-15), the
            2023 four-state expansion, and Johor SE-16.
          </p>
          <p>
            <strong className="text-foreground">Finding:</strong> pact-backed
            seats averaged{" "}
            <strong className="text-foreground">
              {pactSoloStats.pactAvg.toFixed(2)}%
            </strong>{" "}
            vote share ({pactSoloStats.pactWon}/{pactSoloStats.pactTotal} won,{" "}
            {pactSoloStats.pactDepositLoss} deposit
            {pactSoloStats.pactDepositLoss === 1 ? "" : "s"} lost) vs.{" "}
            <strong className="text-foreground">
              {pactSoloStats.soloAvg.toFixed(2)}%
            </strong>{" "}
            solo ({pactSoloStats.soloWon}/{pactSoloStats.soloTotal} won,{" "}
            {pactSoloStats.soloDepositLoss} deposits lost). Every seat MUDA has
            ever won came with coalition backing — no solo run has cleared even
            the 12.5% deposit threshold on average.
          </p>
          <p>
            The clearest single data point is{" "}
            <strong className="text-foreground">Puteri Wangsa</strong>: 43% and
            a win under the pact in 2022, collapsing to 7% and a lost deposit
            contesting solo in 2026 — the same seat, with turnout actually
            rising, meaning this was not voter apathy but active vote-switching
            away from MUDA once the pact ended.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
