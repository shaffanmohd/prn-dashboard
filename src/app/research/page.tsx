"use client";

import { useState } from "react";
import { Navbar } from "@/components/dashboard/Navbar";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ObjectiveOne from "./components/ObjectiveOne";
import ObjectiveTwo from "./components/ObjectiveTwo";
import ObjectiveThree from "./components/ObjectiveThree";
import ObjectiveFour from "./components/ObjectiveFour";

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

          {tab === "o4" && <ObjectiveFour />}
        </div>
      </main>
    </>
  );
}
