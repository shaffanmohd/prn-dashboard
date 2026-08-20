import { MapPin } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-sm tracking-tight">
            MUDA Election Dashboard
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          By SM
        </span>
      </div>
    </header>
  );
}
