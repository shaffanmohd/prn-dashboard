import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ERA_COLORS } from "@/lib/coalition";
import {
  computeRaceCorrelation,
  computeRaceSelectionSummary,
} from "@/lib/research-aggregations";
import { SaluranRawRow } from "@/types/research";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import saluranRawData from "@/data/research/saluran-raw.json";
import { computeRaceByEra } from "@/lib/research-aggregations";
import { useState } from "react";
import { ScatterChart, Scatter, ZAxis } from "recharts";
import { computeRaceScatter } from "@/lib/research-aggregations";
import { EraSeatFilter } from "@/components/research/EraSeatFiller";
import { ScatterTooltip } from "@/components/research/ScatterTooltip";

export default function ObjectiveThree() {
  const saluranRaw = saluranRawData as SaluranRawRow[];

  const raceScatter = useMemo(
    () => computeRaceScatter(saluranRaw),
    [saluranRaw],
  );
  const [raceAxis, setRaceAxis] = useState<"chinese" | "malay" | "indian">(
    "chinese",
  );
  const eraColor = (era: string) =>
    era.startsWith("Pact") ? ERA_COLORS.pact : ERA_COLORS.solo;

  const seatsByEra = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of raceScatter) {
      if (!map.has(p.era)) map.set(p.era, []);
      const seats = map.get(p.era)!;
      if (!seats.includes(p.seat)) seats.push(p.seat);
    }
    return map;
  }, [raceScatter]);

  const allKeys = useMemo(() => {
    const keys: string[] = [];
    seatsByEra.forEach((seats, era) => {
      seats.forEach((seat) => keys.push(`${era}|||${seat}`));
    });
    return keys;
  }, [seatsByEra]);

  const [selectedKeys, setSelectedKeys] = useState<string[] | null>(null);
  const activeKeys = selectedKeys ?? allKeys;

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

  const scatterByEra = useMemo(() => {
    const activeKeySet = new Set(activeKeys);
    const eras = [...new Set(raceScatter.map((p) => p.era))];
    return eras
      .map((era) => ({
        era,
        points: raceScatter
          .filter(
            (p) => p.era === era && activeKeySet.has(`${p.era}|||${p.seat}`),
          )
          .map((p) => ({
            ...p,
            axisValue:
              raceAxis === "chinese"
                ? p.pctChinese
                : raceAxis === "malay"
                  ? p.pctMalay
                  : p.pctIndian,
          })),
      }))
      .filter((e) => e.points.length > 0);
  }, [raceScatter, raceAxis, activeKeys]);

  const filteredSaluranRaw = useMemo(() => {
    const activeKeySet = new Set(activeKeys);
    return saluranRaw.filter((r) => activeKeySet.has(`${r.era}|||${r.seat}`));
  }, [saluranRaw, activeKeys]);

  const raceSelectionSummary = useMemo(
    () => computeRaceSelectionSummary(filteredSaluranRaw),
    [filteredSaluranRaw],
  );

  const RACE_PIE_COLORS = ["#8FA6B2", "#2E5266", "#C6672B", "#D8D3C7"];

  const raceCorrelation = useMemo(
    () => computeRaceCorrelation(filteredSaluranRaw),
    [filteredSaluranRaw],
  );
  const raceByEra = useMemo(
    () => computeRaceByEra(filteredSaluranRaw),
    [filteredSaluranRaw],
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>MUDA vote share by racial bucket</CardTitle>
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
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={raceByEra}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="era" tick={{ fontSize: 10.5 }} />
              <YAxis unit="%" />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)}%`, ""]}
              />
              <Legend />
              <Bar
                dataKey="chinese"
                name="Chinese-majority saluran"
                fill={ERA_COLORS.pact}
              />
              <Bar
                dataKey="malay"
                name="Malay-majority saluran"
                fill="#8FA6B2"
              />
              <Bar
                dataKey="indian"
                name="Indian-significant saluran (≥15%)"
                fill="#C6672B"
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-4">
            Each bar is the voter-weighted average MUDA vote share across
            saluran where one race makes up a majority (≥60% Malay or ≥40%
            Chinese) — or, for Indian voters, a significant presence (≥15%,
            since true Indian-majority saluran are rare in these seats).
          </p>
          <div className="mt-4 p-4 border rounded-md bg-muted/30 text-sm space-y-3">
            <p className="font-semibold text-foreground">Conclusion</p>
            <p className="text-muted-foreground">
              Under the pact (GE-15, JHR SE-15), MUDA&apos;s vote is
              overwhelmingly a Chinese-voter phenomenon — Chinese-majority
              saluran gave MUDA 50-58% vs. 8-15% in Malay-majority saluran. Once
              solo, that gap closes and softens across every Johor SE-16 seat
              MUDA contested, with the racial lean shifting mildly toward
              Malay-majority saluran instead.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">
                Indian voters tell a different story.
              </strong>{" "}
              Indian-significant saluran (≥15% Indian) gave MUDA 33-41% under
              the pact, dropping to 8-20% solo — a real decline, but
              proportionally smaller than the Chinese-vote collapse, and Indian
              support stayed positive in every single era, pact or solo. Unlike
              the Chinese vote, which looks like it was largely borrowed
              coalition-transfer support that vanished with the pact,
              MUDA&apos;s Indian support looks more like a modest, durable base
              that shrank with everything else but didn&apos;t structurally
              disappear.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Correlation: racial % vs MUDA vote share, by era
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
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={raceCorrelation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="era" tick={{ fontSize: 11 }} />
              <YAxis domain={[-1, 1]} />
              <Tooltip formatter={(value) => [Number(value).toFixed(2), ""]} />
              <Legend />
              <Bar dataKey="corrMalay" name="corr w/ % Malay" fill="#8FA6B2" />
              <Bar
                dataKey="corrChinese"
                name="corr w/ % Chinese"
                fill={ERA_COLORS.pact}
              />
              <Bar
                dataKey="corrIndian"
                name="corr w/ % Indian"
                fill="#C6672B"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 border rounded-md bg-muted/30 text-sm space-y-3">
            <p className="font-semibold text-foreground">Conclusion</p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">
                The strongest evidence in this entire analysis: Puteri Wangsa,
                the same seat, pact (2022) vs solo (2026).
              </strong>{" "}
              Under the pact, MUDA&apos;s vote there correlated at +0.95 with %
              Chinese and −0.92 with % Malay — a Chinese-voter phenomenon, very
              close to as strong as a correlation gets. In 2026, solo, in the
              exact same polling streams, that relationship didn&apos;t just
              weaken — it <strong className="text-foreground">reversed</strong>:
              −0.53 with % Chinese, +0.54 with % Malay. This is the cleanest
              possible confirmation that MUDA&apos;s pact-era Chinese support
              was borrowed PH-coalition-transfer vote, not an organic MUDA base
              — it didn&apos;t just shrink when the pact ended, it flipped
              direction.
            </p>
            <p className="text-muted-foreground">
              This pattern holds across the whole SE-16 Johor slate, not just
              Puteri Wangsa: all 4 seats MUDA contested solo (Puteri Wangsa,
              Simpang Jeram, Maharani, Bukit Batu) collapsed to 1-9% vote share,
              and the era-wide correlation moved the same direction (corr
              Chinese −0.28, corr Malay +0.29) — weaker in magnitude than Puteri
              Wangsa alone since it&apos;s averaged across seats with different
              demographics, but consistently pointing away from Chinese and
              mildly toward Malay once solo.
            </p>
            <p className="text-muted-foreground">
              % Indian remains weakly positive-to-neutral across every era
              (+0.15 to +0.33 pact, −0.08 to +0.21 solo) — small and
              inconsistent enough that, unlike Chinese support, it&apos;s hard
              to call it either a borrowed-vote effect or a stable base. It just
              never became a defining factor in either direction.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Selected seats — vote share & racial composition
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
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                MUDA vote share
              </p>
              <p className="text-4xl font-semibold text-foreground">
                {raceSelectionSummary.weightedVoteShare}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {raceSelectionSummary.totalVoters.toLocaleString()}{" "}
                registered voters
              </p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={raceSelectionSummary.raceComposition}
                  dataKey="pct"
                  nameKey="race"
                  outerRadius={80}
                  label={(props) => {
                    const { race, pct } = props as unknown as {
                      race: string;
                      pct: number;
                    };
                    return `${race}: ${pct}%`;
                  }}
                  labelLine={false}
                >
                  {raceSelectionSummary.raceComposition.map((_, i) => (
                    <Cell
                      key={i}
                      fill={RACE_PIE_COLORS[i % RACE_PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            %{" "}
            {raceAxis === "chinese"
              ? "Chinese"
              : raceAxis === "malay"
                ? "Malay"
                : "Indian"}{" "}
            vs. MUDA vote share, per saluran
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
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRaceAxis("chinese")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                raceAxis === "chinese"
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-muted"
              }`}
            >
              % Chinese
            </button>
            <button
              onClick={() => setRaceAxis("malay")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                raceAxis === "malay"
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-muted"
              }`}
            >
              % Malay
            </button>
            <button
              onClick={() => setRaceAxis("indian")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                raceAxis === "indian"
                  ? "bg-foreground text-background border-foreground"
                  : "text-muted-foreground border-muted"
              }`}
            >
              % Indian
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Each dot is one saluran. Toggle between % Chinese and % Malay on the
            X-axis to see each race&apos;s relationship to MUDA&apos;s vote
            share separately — plotting both at once on one axis wouldn&apos;t
            be meaningful since a saluran&apos;s race composition is a mix, not
            a single scale.
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="axisValue"
                name={`% ${raceAxis === "chinese" ? "Chinese" : raceAxis === "malay" ? "Malay" : "Indian"}`}
                unit="%"
                domain={[0, 100]}
                label={{
                  value: `% of saluran's voters who are ${raceAxis === "chinese" ? "Chinese" : raceAxis === "malay" ? "Malay" : "Indian"}`,
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
                    axisLabel={`% ${
                      raceAxis === "chinese"
                        ? "Chinese"
                        : raceAxis === "malay"
                          ? "Malay"
                          : "Indian"
                    }`}
                    axisKey="axisValue"
                  />
                }
              />
              {scatterByEra.map(({ era, points }) => (
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
        </CardContent>
      </Card>
    </>
  );
}
