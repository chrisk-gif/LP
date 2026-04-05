"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/dates";
import { MapPin, Video } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  event_type: string;
  start_time: string;
  end_time?: string | null;
  all_day?: boolean;
  location?: string | null;
  color?: string;
  area?: { name: string; slug: string; color: string } | null;
}

export interface CalendarTask {
  id: string;
  title: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority: string;
  status: string;
  area?: { name: string; slug: string; color: string } | null;
  estimated_minutes?: number | null;
}

interface EventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: (event: CalendarEvent) => void;
}

// ---------------------------------------------------------------------------
// Event type color mapping
// ---------------------------------------------------------------------------

const EVENT_COLORS: Record<string, string> = {
  meeting: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
  deadline: "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300",
  reminder: "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300",
  focus_block: "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300",
  personal: "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300",
  travel: "bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-300",
  workout: "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300",
  other: "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-300",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventCard({ event, compact = false, onClick }: EventCardProps) {
  const colorClass =
    EVENT_COLORS[event.event_type] ?? EVENT_COLORS.other;

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={cn(
        "w-full rounded-md border-l-[3px] px-2 text-left transition-opacity hover:opacity-80",
        colorClass,
        compact ? "py-0.5 text-[11px] leading-tight" : "py-1.5 text-xs"
      )}
      style={
        event.area?.color
          ? { borderLeftColor: event.area.color }
          : undefined
      }
    >
      <div className="font-medium truncate">{event.title}</div>
      {!compact && (
        <div className="flex items-center gap-2 mt-0.5 opacity-80">
          <span>
            {formatTime(event.start_time)}
            {event.end_time && ` - ${formatTime(event.end_time)}`}
          </span>
          {event.location && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>
      )}
    </button>
  );
}
