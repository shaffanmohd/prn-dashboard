"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveSummaryStrip } from "@/components/dashboard/LiveSummaryStrip";
import type { LiveState } from "@/types/election";

interface Props {
  slug: string;
  live: LiveState;
}

export function LivePanel({ slug, live }: Props) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-2 border-border"
      onClick={() => router.push(`/dashboard/${slug}/live`)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Live results</CardTitle>
          <span className="text-xs text-blue-600 font-medium">
            View detail →
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <LiveSummaryStrip live={live} />
      </CardContent>
    </Card>
  );
}
