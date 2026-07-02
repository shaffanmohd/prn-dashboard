"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { SeatPicker } from "@/components/dashboard/SeatPicker";
import { StatCards } from "@/components/dashboard/StatCards";
import { LivePanel } from "@/components/dashboard/LivePanel";
import { SeatHistoryCard } from "@/components/dashboard/SeatHistoryCard";
import { CandidatesCard } from "@/components/dashboard/CandidatesCard";
import { SaluranCard } from "@/components/dashboard/SaluranCard";
import {
  MOCK_SEATS,
  MOCK_BALLOTS,
  MOCK_STATS,
  MOCK_SALURAN,
  MOCK_LIVE,
} from "@/data/mock";

export default function DashboardPage() {
  const [slug, setSlug] = useState("n15-maharani-johor");

  const seatName = MOCK_SEATS.find((s) => s.slug === slug)?.seat ?? "";

  const seatBallots = MOCK_BALLOTS.filter((b) => b.seat === seatName);
  const seatStats = MOCK_STATS.filter((s) => s.seat === seatName);
  const saluran = MOCK_SALURAN[slug] ?? [];
  const live = MOCK_LIVE[slug];

  const latestStats = seatStats[0] ?? null;
  const latestWinner =
    seatBallots.find(
      (b) => b.election === latestStats?.election && b.rank === 1,
    ) ?? null;

  if (!live || !latestStats || !latestWinner) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <SeatPicker seats={MOCK_SEATS} selected={slug} onChange={setSlug} />
          <LivePanel slug={slug} live={live} />
          <StatCards stats={latestStats} winner={latestWinner} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SeatHistoryCard ballots={seatBallots} stats={seatStats} />
            <CandidatesCard ballots={seatBallots} />
          </div>
          <SaluranCard rows={saluran} />
        </div>
      </main>
    </>
  );
}
