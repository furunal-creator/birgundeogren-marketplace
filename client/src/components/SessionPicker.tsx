import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users } from "lucide-react";

interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  locationType: string;
  city?: string | null;
  address?: string | null;
  capacity: number;
  enrolled: number;
  status: string;
}

interface SessionPickerProps {
  sessions: Session[];
  value?: number;
  onChange: (sessionId: number) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default function SessionPicker({ sessions, value, onChange }: SessionPickerProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2 px-3 border rounded-lg bg-muted/30">
        Yakında seans eklenecek
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Select
        value={value?.toString()}
        onValueChange={(v) => onChange(parseInt(v))}
      >
        <SelectTrigger className="w-full" data-testid="select-session">
          <SelectValue placeholder="Seans seçin..." />
        </SelectTrigger>
        <SelectContent>
          {sessions.map((session) => {
            const remaining = session.capacity - session.enrolled;
            const isFull = remaining <= 0 || session.status === "FULL";
            return (
              <SelectItem
                key={session.id}
                value={session.id.toString()}
                disabled={isFull}
                data-testid={`session-option-${session.id}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{formatDate(session.date)}</span>
                  <span className="text-xs text-muted-foreground">
                    {session.startTime} – {session.endTime}
                    {session.city && ` · ${session.city}`}
                    {isFull ? " · Dolu" : ` · ${remaining} yer kaldı`}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Show selected session details */}
      {value && (
        <div className="text-sm text-muted-foreground space-y-1">
          {(() => {
            const s = sessions.find(s => s.id === value);
            if (!s) return null;
            const remaining = s.capacity - s.enrolled;
            return (
              <>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#E8872A]" />
                  <span>{formatDate(s.date)}, {s.startTime}–{s.endTime}</span>
                </div>
                {s.locationType === "PHYSICAL" && s.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#E8872A]" />
                    <span>{s.address}, {s.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#E8872A]" />
                  <span className={remaining <= 3 ? "text-orange-600 font-medium" : ""}>
                    {remaining <= 3 ? `⚡ Sadece ${remaining} yer kaldı!` : `${remaining} / ${s.capacity} yer müsait`}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
