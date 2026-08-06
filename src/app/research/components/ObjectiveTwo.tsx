import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SaluranRawRow } from "@/types/research";
import { useMemo, useState } from "react";
import saluranRawData from "@/data/research/saluran-raw.json";

import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ERA_COLORS } from "@/lib/coalition";
import {
  computeEraTopSummary,
  computeYouthScatter,
  pearsonCorr,
} from "@/lib/research-aggregations";
import { EraSeatFilter } from "@/components/research/EraSeatFiller";

export default function ObjectiveTwo() {
  const [selectedKeys, setSelectedKeys] = useState<string[] | null>(null);

  const saluranRaw = saluranRawData as SaluranRawRow[];

  const eraTop10 = useMemo(
    () => computeEraTopSummary(saluranRaw, 10),
    [saluranRaw],
  );
  const eraTop20 = useMemo(
    () => computeEraTopSummary(saluranRaw, 20),
    [saluranRaw],
  );
  const youthScatter = useMemo(
    () => computeYouthScatter(saluranRaw),
    [saluranRaw],
  );

  const scatterByEra = useMemo(() => {
    const eras = [...new Set(youthScatter.map((p) => p.era))];
    return eras.map((era) => ({
      era,
      points: youthScatter.filter((p) => p.era === era),
    }));
  }, [youthScatter]);

  const eraColor = (era: string) =>
    era.startsWith("Pact") ? ERA_COLORS.pact : ERA_COLORS.solo;
  const seatsByEra = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of youthScatter) {
      if (!map.has(p.era)) map.set(p.era, []);
      const seats = map.get(p.era)!;
      if (!seats.includes(p.seat)) seats.push(p.seat);
    }
    return map;
  }, [youthScatter]);

  const allKeys = useMemo(() => {
    const keys: string[] = [];
    seatsByEra.forEach((seats, era) => {
      seats.forEach((seat) => keys.push(`${era}|||${seat}`));
    });
    return keys;
  }, [seatsByEra]);

  const [topN, setTopN] = useState<number>(10);
  const activeKeys = selectedKeys ?? allKeys;

  const rankedFiltered = useMemo(() => {
    const activeKeySet = new Set(activeKeys);
    const filtered = saluranRaw.filter((r) =>
      activeKeySet.has(`${r.era}|||${r.seat}`),
    );
    const sorted = filtered
      .slice()
      .sort((a, b) => b.muda_vote_share - a.muda_vote_share);
    return topN === -1 ? sorted : sorted.slice(0, topN);
  }, [saluranRaw, activeKeys, topN]);

  const isSeatActive = (era: string, seat: string) =>
    activeKeys.includes(`${era}|||${seat}`);

  const isEraFullyActive = (era: string) =>
    (seatsByEra.get(era) ?? []).every((seat) => isSeatActive(era, seat));

  const isEraPartiallyActive = (era: string) => {
    const seats = seatsByEra.get(era) ?? [];
    const activeCount = seats.filter((seat) => isSeatActive(era, seat)).length;
    return activeCount > 0 && activeCount < seats.length;
  };

  const toggleSeat = (era: string, seat: string) => {
    setSelectedKeys((prev) => {
      const current = prev ?? allKeys;
      const key = `${era}|||${seat}`;
      return current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key];
    });
  };

  const toggleEra = (era: string) => {
    const seats = seatsByEra.get(era) ?? [];
    const eraKeys = seats.map((seat) => `${era}|||${seat}`);
    setSelectedKeys((prev) => {
      const current = prev ?? allKeys;
      const allOn = seats.every((seat) => isSeatActive(era, seat));
      return allOn
        ? current.filter((k) => !eraKeys.includes(k))
        : [...new Set([...current, ...eraKeys])];
    });
  };

  const filteredScatterByEra = useMemo(
    () =>
      scatterByEra
        .map((e) => ({
          era: e.era,
          points: e.points.filter((p) =>
            activeKeys.includes(`${p.era}|||${p.seat}`),
          ),
        }))
        .filter((e) => e.points.length > 0),
    [scatterByEra, activeKeys],
  );

  const filteredYouthCorr = useMemo(() => {
    const activeKeySet = new Set(activeKeys);
    const eras = [...seatsByEra.keys()];

    return eras
      .map((era) => {
        const seats = seatsByEra.get(era) ?? [];
        const activeSeatsInEra = seats.filter((seat) =>
          activeKeySet.has(`${era}|||${seat}`),
        );
        if (activeSeatsInEra.length === 0) return null;

        const activeSeatSet = new Set(activeSeatsInEra);
        const rows = saluranRaw.filter(
          (r) => r.era === era && activeSeatSet.has(r.seat),
        );
        return {
          era,
          corr: Number(
            pearsonCorr(
              rows.map((r) => r.pct_youth),
              rows.map((r) => r.muda_vote_share),
            ).toFixed(2),
          ),
        };
      })
      .filter((x): x is { era: string; corr: number } => x !== null);
  }, [saluranRaw, seatsByEra, activeKeys]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Youth % vs. MUDA vote share, per saluran</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Question to answer: did MUDA capture the youth vote? */}
          <div className="mt-8">
            <div className="mb-4">
              <EraSeatFilter
                seatsByEra={seatsByEra}
                activeKeys={activeKeys}
                onToggleEra={toggleEra}
                onToggleSeat={toggleSeat}
                eraColor={eraColor}
                isEraFullyActive={isEraFullyActive}
                isEraPartiallyActive={isEraPartiallyActive}
                isSeatActive={isSeatActive}
              />
            </div>
            <ResponsiveContainer width="100%" height={800}>
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="pctYouth"
                  name="% aged 18-30"
                  unit="%"
                  domain={[0, 100]}
                  label={{
                    value: "% of saluran's voters aged 18–30",
                    position: "bottom",
                    offset: 10,
                    fontSize: 11,
                    fill: "#5B6670",
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="mudaVoteShare"
                  name="MUDA vote share"
                  unit="%"
                  label={{
                    value: "MUDA vote share (%)",
                    angle: -90,
                    position: "left",
                    offset: 20,
                    fontSize: 11,
                    fill: "#5B6670",
                  }}
                />
                <ZAxis
                  type="number"
                  dataKey="voters"
                  range={[20, 200]}
                  name="voters"
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) =>
                    name === "voters"
                      ? [value, "Voters"]
                      : [`${Number(value).toFixed(1)}%`, name]
                  }
                />
                {filteredScatterByEra.map(({ era, points }) => (
                  <Scatter
                    key={era}
                    name={era}
                    data={points}
                    fill={eraColor(era)}
                    fillOpacity={0.6}
                  />
                ))}
                <Legend verticalAlign="top" height={30} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              {filteredYouthCorr.map((c) => (
                <span key={c.era}>
                  <strong className="text-foreground">{c.era}</strong>: r ={" "}
                  {c.corr}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            This answers:{" "}
            <strong className="text-foreground">
              did MUDA capture the youth vote, by era?
            </strong>{" "}
            Each dot is one saluran (polling stream). Its position left-to-right
            shows how youth-heavy that saluran&apos;s voter roll is (% aged
            18–30); its position bottom-to-top shows how well MUDA actually did
            there (vote share %). Dot size reflects how many voters are in that
            saluran.
            <br />
            <br />
            <strong className="text-foreground">Finding:</strong> the youth
            premium is inconsistent across pact-era seats. Johor DUN pact seats
            show a real premium (youth-block saluran averaged 38.3% vote share
            vs. 31.4% in regular saluran, +6.9pts). The GE-15 federal seats show
            the opposite — a slightly negative premium (21.1% vs 24.0%, −2.9pts)
            once all six MUDA-contested seats are included, not just Muar and
            Tanjung Piai. Larkin, the one seat where PH genuinely contested
            against MUDA in Johor SE-15, shows almost no premium either way
            (14.0% vs 13.2%). Only Temiang (solo, N9) shows youth-heavy saluran
            clearly outperforming — though on a very thin sample (2 qualifying
            saluran, ~1,200 voters).
            <br />
            <br />
            The <strong className="text-foreground">r value</strong> below each
            era is a correlation coefficient across all saluran in that group:
            closer to +1 means youth-heavy saluran reliably did better for MUDA,
            closer to 0 means no relationship, negative means youth-heavy
            saluran did worse.
          </p>
        </CardContent>
      </Card>

      {/* Question 1: which saluran did MUDA win the most vote share from? */}
      <Card>
        <CardHeader>
          <CardTitle>
            Best-performing saluran, ranked by MUDA vote share
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            This answers:{" "}
            <strong className="text-foreground">
              which saluran did MUDA receive the most vote share from, across
              all eras?
            </strong>{" "}
            Uses the same era/seat filter as the chart above — untick eras there
            to narrow this list down too. The % aged 18-30 column shows whether
            MUDA&apos;s best saluran are actually youth-heavy or not.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">Show:</span>
            {[10, 20, 50].map((n) => (
              <button
                key={n}
                onClick={() => setTopN(n)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  topN === n
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-muted"
                }`}
              >
                Top {n}
              </button>
            ))}
            <button
              onClick={() => setTopN(-1)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                topN === -1
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-muted"
              }`}
            >
              All (
              {
                saluranRaw.filter((r) =>
                  activeKeys.includes(`${r.era}|||${r.seat}`),
                ).length
              }
              )
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Era</th>
                  <th className="py-2 pr-3">Seat</th>
                  <th className="py-2 pr-3">Saluran</th>
                  <th className="py-2 pr-3 text-right">Voters</th>
                  <th className="py-2 pr-3 text-right">% aged 18-30</th>
                  <th className="py-2 pr-3 text-right">MUDA vote share</th>
                </tr>
              </thead>
              <tbody>
                {rankedFiltered.map((r, i) => (
                  <tr
                    key={`${r.dm}-${r.pm}-${r.saluran}-${i}`}
                    className="border-b border-muted/50"
                  >
                    <td className="py-1.5 pr-3 text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="py-1.5 pr-3">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: `${eraColor(r.era)}20`,
                          color: eraColor(r.era),
                        }}
                      >
                        {r.era}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3">{r.seat}</td>
                    <td className="py-1.5 pr-3">
                      {r.dm} · #{r.saluran}
                    </td>
                    <td className="py-1.5 pr-3 text-right">{r.voters}</td>
                    <td className="py-1.5 pr-3 text-right">
                      {r.pct_youth.toFixed(1)}%
                    </td>
                    <td className="py-1.5 pr-3 text-right font-medium">
                      {r.muda_vote_share.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Conclusion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-3">Era</th>
                  <th className="py-2 pr-3 text-right">Top 10 avg</th>
                  <th className="py-2 pr-3 text-right">Top 20 avg</th>
                  <th className="py-2 pr-3">Best saluran</th>
                  <th className="py-2 pr-3 text-right">Best vote share</th>
                  <th className="py-2 pr-3 text-right">
                    Best salurans % youth
                  </th>
                </tr>
              </thead>
              <tbody>
                {eraTop10.map((row, i) => (
                  <tr key={row.era} className="border-b border-muted/50">
                    <td
                      className="py-1.5 pr-3 font-medium"
                      style={{ color: eraColor(row.era) }}
                    >
                      {row.era}
                    </td>
                    <td className="py-1.5 pr-3 text-right">{row.topNAvg}%</td>
                    <td className="py-1.5 pr-3 text-right">
                      {eraTop20[i]?.topNAvg}%
                    </td>
                    <td className="py-1.5 pr-3">{row.bestSeat}</td>
                    <td className="py-1.5 pr-3 text-right font-medium">
                      {row.bestVoteShare}%
                    </td>
                    <td className="py-1.5 pr-3 text-right">
                      {row.bestPctYouth}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground my-2">
              <strong className="text-foreground">Top 10/20 avg</strong> = the
              average MUDA vote share across that era&apos;s 10 (or 20)
              highest-performing saluran — a measure of how strong MUDA&apos;s
              best pockets are, not the seat-wide average. <br />
              <strong className="text-foreground">
                Best saluran&apos;s % youth
              </strong>{" "}
              = what share of registered voters in that single best-performing
              saluran are aged 18–30 — shown to check whether MUDA&apos;s
              strongest saluran are actually youth-heavy, or whether something
              else (e.g. race, candidate brand) is driving the result there.
            </p>
          </div>

          <div className="mb-6 p-4 border rounded-md bg-muted/30 text-sm space-y-3">
            <p className="font-semibold text-foreground">Conclusion</p>
            <div>
              <p className="font-medium text-foreground mb-1">
                1. Which saluran did MUDA capture the most vote from, pact vs
                solo?
              </p>
              <p className="text-muted-foreground">
                In every era without exception, MUDA&apos;s single
                best-performing saluran is 0–1% youth — their strongest results
                come from streams that are almost entirely non-young voters.
                Pact-era peaks (84–87% vote share) dwarf solo-era peaks
                (13–47%), which confirms the Objective 1 pact-vs-solo collapse
                again from a different angle. But the youth breakdown adds
                something new: MUDA&apos;s absolute best results were never
                driven by youth capture. Something else explains those peak
                saluran — most likely ethnic composition, which Objective 3
                checks directly.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                2. Did MUDA capture the youth vote — pact vs solo?
              </p>
              <p className="text-muted-foreground">
                Not reliably, in either condition — but the reasons differ by
                seat type, not by pact status. Pact-GE15 (federal) shows
                youth-heavy saluran doing worse than regular ones (21.1% vs
                24.0%). Pact-JHR SE15 (state) shows the opposite — a real youth
                premium (38.3% vs 31.4%, +6.9pts), the only era with an
                unambiguous youth effect. Solo-Larkin is flat (14.0% vs 13.2%).
                Solo-N9 SE15 shows a premium (10.5% vs 5.6%) but on only 2
                qualifying saluran (~1,200 voters) — too thin to trust. MUDA
                captured youth votes in exactly one of four measurable
                conditions, and it wasn&apos;t the biggest driver of their best
                results even there. Seat type (state vs federal) predicts youth
                responsiveness better than pact status does — state seats appear
                more locally rooted, where a young local candidate&apos;s ground
                presence may matter more relative to national party-brand
                effects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
