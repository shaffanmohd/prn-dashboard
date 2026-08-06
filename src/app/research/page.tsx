"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import type { KLSeatScreen } from "@/types/research";

import objective4Data from "@/data/research/objective4.json";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ObjectiveOne from "./components/ObjectiveOne";
import ObjectiveTwo from "./components/ObjectiveTwo";
import ObjectiveThree from "./components/ObjectiveThree";

const objective4 = objective4Data as KLSeatScreen[];

const TABS = [
  { id: "o1", label: "01 · Pact vs Solo" },
  { id: "o2", label: "02 · Youth Targeting" },
  { id: "o3", label: "03 · Racial Shift" },
  { id: "o4", label: "04 · GE16 / KL" },
] as const;

export default function ResearchPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("o1");
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 ">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-1 pl-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">Research</p>
              <h1 className="text-lg font-semibold">
                Breakdown of MUDA performance
              </h1>
            </div>
          </div>
          <div className="flex gap-1 border rounded-md p-1 bg-muted">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 text-xs font-medium py-2 rounded-sm transition-colors ${
                  tab === t.id
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "o1" && <ObjectiveOne />}

          {tab === "o2" && <ObjectiveTwo />}

          {tab === "o3" && <ObjectiveThree />}

          {tab === "o4" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  KL seats — composition & {objective4[0]?.election ?? "GE-15"}{" "}
                  margin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objective4
                  .slice()
                  .sort((a, b) => b.pctChinese - a.pctChinese)
                  .map((s) => (
                    <div key={s.seat} className="border rounded-md p-3 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{s.seat}</span>
                        <span>{s.marginPerc?.toFixed(1) ?? "—"}pt margin</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {s.pctChinese}% Chinese · {s.pctMalay}% Malay ·{" "}
                        {s.pctIndian}% Indian · won by {s.winningCoalition}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
