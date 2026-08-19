import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SaluranRawRow } from "@/types/research";
import { useMemo, useState } from "react";
import saluranRawData from "@/data/research/saluran-raw.json";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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
  computeAgeBandCorrelation,
  computeEraTopSummary,
  computeSelectionSummary,
  computeYouthScatter,
  pearsonCorr,
} from "@/lib/research-aggregations";
import { EraSeatFilter } from "@/components/research/EraSeatFiller";
import { ScatterTooltip } from "@/components/research/ScatterTooltip";

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
              rows.map((r) => r.pct_18_30),
              rows.map((r) => r.muda_vote_share),
            ).toFixed(2),
          ),
        };
      })
      .filter((x): x is { era: string; corr: number } => x !== null);
  }, [saluranRaw, seatsByEra, activeKeys]);

  const filteredSaluranRaw = useMemo(() => {
    const activeKeySet = new Set(activeKeys);
    return saluranRaw.filter((r) => activeKeySet.has(`${r.era}|||${r.seat}`));
  }, [saluranRaw, activeKeys]);

  const ageBandCorrelation = useMemo(
    () => computeAgeBandCorrelation(filteredSaluranRaw),
    [filteredSaluranRaw],
  );

  const selectionSummary = useMemo(
    () => computeSelectionSummary(filteredSaluranRaw),
    [filteredSaluranRaw],
  );

  const PIE_COLORS = [
    "#2E5266",
    "#5D8AA8",
    "#8FA6B2",
    "#C9A876",
    "#D9975C",
    "#C6672B",
    "#A34A1F",
  ];

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
                  content={
                    <ScatterTooltip
                      axisLabel="% aged 18-30"
                      axisKey="pctYouth"
                    />
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

      <Card>
        <CardHeader>
          <CardTitle>
            Correlation: age band % vs MUDA vote share, by era
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          <p className="text-xs text-muted-foreground mb-3">
            This answers:{" "}
            <strong className="text-foreground">
              which specific age group actually votes MUDA
            </strong>{" "}
            — not just &quot;young vs not,&quot; but across all five bands. Each
            bar is a correlation coefficient (r) between that age band&apos;s
            share of a saluran&apos;s voters and MUDA&apos;s vote share there,
            across every saluran in that era. +1 = that age band consistently
            means more MUDA votes; −1 = consistently fewer; 0 = no relationship.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ageBandCorrelation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="era" tick={{ fontSize: 10 }} />
              <YAxis domain={[-1, 1]} />
              <Tooltip formatter={(value) => [Number(value).toFixed(2), ""]} />
              <Legend />
              <Bar dataKey="corr18to30" name="18-30" fill={ERA_COLORS.pact} />
              <Bar dataKey="corr31to40" name="31-40" fill="#5D8AA8" />
              <Bar dataKey="corr41to50" name="41-50" fill="#8FA6B2" />
              <Bar dataKey="corr51to60" name="51-60" fill="#C9A876" />
              <Bar dataKey="corr61to70" name="61-70" fill="#D9975C" />
              <Bar dataKey="corr71to80" name="71-80" fill="#C6672B" />
              <Bar dataKey="corr81plus" name="81+" fill={ERA_COLORS.solo} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 border rounded-md bg-muted/30 text-sm space-y-3">
            <p className="font-semibold text-foreground">Conclusion</p>
            <p className="text-muted-foreground">
              Under every pact era (GE-15, JHR SE-15), age barely matters at all
              — every band sits close to 0 (|r| under 0.15). This confirms
              MUDA&apos;s pact-era support wasn&apos;t an age story; it was a
              race story (see Objective 3). Once solo, a real pattern shows up
              in the two eras with a clear signal (JHR SE-16 and N9 SE-15):
              younger and middle-aged bands (18-50) trend positive, while the
              61+ band is consistently and often strongly negative (as low as
              −0.65 in N9 SE-15, −0.35 in Puteri Wangsa specifically). The
              divide isn&apos;t narrowly &quot;young vs old&quot; — it&apos;s
              closer to &quot;under ~50 is receptive, over 60 actively
              isn&apos;t.&quot;
            </p>
            <p className="text-muted-foreground">
              Puteri Wangsa&apos;s own before/after tells the same story more
              precisely: the 18-30 correlation roughly doubled once solo (+0.15
              → +0.35), and the 61+ correlation went from essentially flat to
              clearly negative (−0.02 → −0.35) — the seat&apos;s age composition
              barely changed between 2022 and 2026, but once the pact-driven,
              cross-age Chinese vote disappeared, what remained of MUDA&apos;s
              support turned out to have always leaned young and struggled with
              elderly voters — just invisible before because the bigger,
              age-blind pact effect was drowning it out.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Selected seats — vote share & age composition</CardTitle>
        </CardHeader>
        <CardContent>
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
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                MUDA vote share
              </p>
              <p className="text-4xl font-semibold text-foreground">
                {selectionSummary.weightedVoteShare}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {selectionSummary.totalVoters.toLocaleString()}{" "}
                registered voters
              </p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={selectionSummary.ageComposition}
                  dataKey="pct"
                  nameKey="band"
                  outerRadius={80}
                  label={(props) => {
                    const { band, pct } = props as unknown as {
                      band: string;
                      pct: number;
                    };
                    return `${band}: ${pct}%`;
                  }}
                  labelLine={false}
                >
                  {selectionSummary.ageComposition.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
                      {r.pct_18_30.toFixed(1)}%
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
                Pact-era peaks (84-87% vote share) dwarf solo-era peaks
                (13-47%), confirming the Objective 1 collapse again from a
                different angle. Across the original 4 eras, MUDA&apos;s single
                best-ever saluran was consistently 0-1% youth — old, likely
                ethnically distinct outlier streams. But that pattern breaks the
                moment Johor SE-16 (MUDA&apos;s current solo seat) enters the
                data: their best current solo-era result, Maharani at 15.8%,
                comes from a{" "}
                <strong className="text-foreground">100% youth</strong> saluran
                — the opposite of every pact-era peak. See the age-band
                correlation below for why.
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
            <div>
              <p className="font-medium text-foreground mb-1">
                3. What does the Puteri Wangsa same-seat comparison confirm?
              </p>
              <p className="text-muted-foreground">
                Puteri Wangsa is the only seat with real before/after saluran
                data — pact (2022) vs solo (2026), same physical polling
                streams. The youth premium held in both eras (pact: 49.1%
                youth-block vs 43.1% regular; solo: 8.2% vs 6.1%) — a modest,
                consistent edge either way. But the overall collapse (44.4% →
                6.8%, a 37.6pt drop) dwarfs that small youth signal. Youth
                targeting is a minor factor next to whatever caused the
                seat-wide crash.Youth targeting is a minor factor next to
                whatever caused the seat-wide crash. That said, a fuller age
                breakdown (all 5 bands, not just youth vs. not) shows the real
                story is sharper than a simple youth premium — see the age-band
                correlation chart above.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
