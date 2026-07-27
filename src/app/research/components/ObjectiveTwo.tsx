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
  computeRankedSaluran,
  computeYouthScatter,
  pearsonCorr,
} from "@/lib/research-aggregations";
import { EraSeatFilter } from "@/components/research/EraSeatFiller";

export default function ObjectiveTwo() {
  const saluranRaw = saluranRawData as SaluranRawRow[];

  const rankedSaluran = useMemo(
    () => computeRankedSaluran(saluranRaw, 10),
    [saluranRaw],
  );
  const youthScatter = useMemo(
    () => computeYouthScatter(saluranRaw),
    [saluranRaw],
  );

  const rankedByEra = useMemo(() => {
    const map = new Map<string, typeof rankedSaluran>();
    for (const row of rankedSaluran) {
      if (!map.has(row.era)) map.set(row.era, []);
      map.get(row.era)!.push(row);
    }
    return Array.from(map.entries());
  }, [rankedSaluran]);

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
          {/* Question 2: did MUDA capture the youth vote? */}
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
          <CardTitle> Top 10 saluran by MUDA vote share, per era</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-8 space-y-5">
            {rankedByEra.map(([era, rows]) => (
              <div key={era}>
                <p
                  className="text-xs font-medium mb-1.5"
                  style={{ color: eraColor(era) }}
                >
                  {era}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="py-2 pr-3">Seat</th>
                        <th className="py-2 pr-3">Saluran</th>
                        <th className="py-2 pr-3 text-right">Voters</th>
                        <th className="py-2 pr-3 text-right">% aged 18-30</th>
                        <th className="py-2 pr-3 text-right">
                          MUDA vote share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className="border-b border-muted/50">
                          <td className="py-1.5 pr-3">{r.seat}</td>
                          <td className="py-1.5 pr-3">
                            {r.dm} · #{r.saluran}
                          </td>
                          <td className="py-1.5 pr-3 text-right">{r.voters}</td>
                          <td className="py-1.5 pr-3 text-right">
                            {r.pctYouth.toFixed(1)}%
                          </td>
                          <td className="py-1.5 pr-3 text-right font-medium">
                            {r.mudaVoteShare.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground -mt-1 mb-3">
            This answers:{" "}
            <strong className="text-foreground">
              which saluran did MUDA receive the most vote share from, by era?
            </strong>{" "}
            This is a direct ranking, not a statistical pattern — it names
            MUDA&apos;s actual best-performing polling streams, now split into
            four groups: GE-15 (pact, all 6 seats), Johor SE-15 (pact, 6 seats),
            Larkin (Johor SE-15, the one seat PH genuinely contested against
            MUDA — tracked separately since it doesn&apos;t fit either
            &quot;pact&quot; or the other solo seats), and N9 SE-15 Temiang
            (solo). Cross-check the % aged 18-30 column against the scatter
            chart above — where they agree, the finding is solid; where they
            don&apos;t, MUDA&apos;s real strength in that seat likely lies
            elsewhere (e.g. race, covered in Objective 3, or candidate-specific
            factors).
          </p>
        </CardContent>
      </Card>
    </>
  );
}
