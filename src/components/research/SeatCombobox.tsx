"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { KLSeatScreen } from "@/types/research";

interface SeatComboboxProps {
  seats: KLSeatScreen[];
  onSelect: (seat: KLSeatScreen) => void;
}

export function SeatCombobox({ seats, onSelect }: SeatComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-xs font-normal"
        >
          {value
            ? seats.find((s) => s.seat === value)?.seat
            : "Search a KL seat to auto-fill demographics..."}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search seat..." className="text-xs" />
          <CommandList>
            <CommandEmpty>No seat found.</CommandEmpty>
            <CommandGroup>
              {seats.map((s) => (
                <CommandItem
                  key={s.seat}
                  value={s.seat}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                    const match = seats.find(
                      (seat) => seat.seat === currentValue,
                    );
                    if (match) onSelect(match);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3.5 w-3.5",
                      value === s.seat ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {s.seat} — {s.pctChinese}% Chinese, {s.pctMalay}% Malay
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
