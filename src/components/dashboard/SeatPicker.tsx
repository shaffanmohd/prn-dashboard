"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { SeatDropdownItem } from "@/types/election";

interface Props {
  seats: SeatDropdownItem[];
  selected: string;
  onChange: (slug: string) => void;
}

export function SeatPicker({ seats, selected, onChange }: Props) {
  const current = seats.find((s) => s.slug === selected);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Seat dashboard</p>
        <Select value={selected} onValueChange={onChange}>
          <SelectTrigger className="w-72 text-base font-semibold border-none shadow-none px-0 focus:ring-0 h-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seats.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.seat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {current?.type === "dun" ? "DUN" : "Parliament"}
        </Badge>
        <Badge
          variant="outline"
          className="text-xs text-amber-600 border-amber-300 bg-amber-50"
        >
          Mock data
        </Badge>
      </div>
    </div>
  );
}
