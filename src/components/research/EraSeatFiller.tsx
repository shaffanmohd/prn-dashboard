"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";

interface EraSeatFilterProps {
  seatsByEra: Map<string, string[]>;
  activeKeys: string[];
  onToggleEra: (era: string) => void;
  onToggleSeat: (era: string, seat: string) => void;
  eraColor: (era: string) => string;
  isEraFullyActive: (era: string) => boolean;
  isEraPartiallyActive: (era: string) => boolean;
  isSeatActive: (era: string, seat: string) => boolean;
}

export function EraSeatFilter({
  seatsByEra,
  activeKeys,
  onToggleEra,
  onToggleSeat,
  eraColor,
  isEraFullyActive,
  isEraPartiallyActive,
  isSeatActive,
}: EraSeatFilterProps) {
  const [expandedEras, setExpandedEras] = useState<Set<string>>(
    new Set(seatsByEra.keys()),
  );

  const totalSeats = [...seatsByEra.values()].reduce(
    (sum, seats) => sum + seats.length,
    0,
  );
  const totalEras = seatsByEra.size;
  const activeEraCount = [...seatsByEra.keys()].filter(
    (era) => isEraFullyActive(era) || isEraPartiallyActive(era),
  ).length;

  const toggleExpanded = (era: string) => {
    setExpandedEras((prev) => {
      const next = new Set(prev);
      if (next.has(era)) {
        next.delete(era);
      } else {
        next.add(era);
      }
      return next;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Filter className="h-3.5 w-3.5" />
          {activeKeys.length === totalSeats
            ? `All eras (${totalEras})`
            : `${activeEraCount}/${totalEras} eras · ${activeKeys.length}/${totalSeats} seats`}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3 max-h-96 overflow-y-auto"
        align="start"
      >
        <div className="space-y-3">
          {[...seatsByEra.entries()].map(([era, seats]) => {
            const expanded = expandedEras.has(era);
            return (
              <div key={era}>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleExpanded(era)}
                    className="p-0.5 hover:bg-muted rounded"
                  >
                    {expanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer flex-1">
                    <Checkbox
                      checked={
                        isEraFullyActive(era)
                          ? true
                          : isEraPartiallyActive(era)
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={() => onToggleEra(era)}
                    />
                    <span style={{ color: eraColor(era) }}>{era}</span>
                    <span className="text-muted-foreground font-normal ml-auto">
                      {seats.filter((s) => isSeatActive(era, s)).length}/
                      {seats.length}
                    </span>
                  </label>
                </div>
                {expanded && (
                  <div className="pl-8 mt-1.5 space-y-1.5">
                    {seats.map((seat) => (
                      <label
                        key={seat}
                        className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer"
                      >
                        <Checkbox
                          checked={isSeatActive(era, seat)}
                          onCheckedChange={() => onToggleSeat(era, seat)}
                        />
                        {seat}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
