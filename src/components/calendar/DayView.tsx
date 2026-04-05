"use client";

import { useMemo } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/dates";
import { EventCard, type CalendarEvent, type CalendarTask } from "./EventCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  onSlotClick?: (date: Date, hour: number) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DISPLAY_HOURS = HOURS.filter((h) => h >= 6 && h <= 22);

function getEventHour(event: CalendarEvent): number {
  return parseISO(event.start_time).getHours();
}

function getEventDuration(event: CalendarEvent): number {
  if (!event.end_time) return 1;
  const start = parseISO(event.start_time);
  const end = parseISO(event.end_time);
  return Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DayView({
  date,
  events,
  tasks,
  onSlotClick,
  onEventClick,
}: DayViewProps) {
  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(parseISO(e.start_time), date)),
    [events, date]
  );

  const allDayEvents = dayEvents.filter((e) => e.all_day);
  const timedEvents = dayEvents.filter((e) => !e.all_day);

  const dayTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (t.scheduled_date && isSameDay(parseISO(t.scheduled_date), date)) ||
          (t.due_date && isSameDay(parseISO(t.due_date), date))
      ),
    [tasks, date]
  );

  return (
    <div className="flex flex-col">
      {/* Day header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold capitalize">
          {format(date, "EEEE d. MMMM yyyy", { locale: nb })}
        </h2>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="border-b px-4 py-2 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">
            Hele dagen
          </span>
          {allDayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={onEventClick}
            />
          ))}
        </div>
      )}

      {/* Scheduled tasks (no specific time) */}
      {dayTasks.length > 0 && (
        <div className="border-b px-4 py-2 space-y-1">
          <span className="text-xs text-muted-foreground font-medium">
            Oppgaver
          </span>
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-md border-l-[3px] bg-accent/50 px-2 py-1.5 text-xs"
              style={{
                borderLeftColor: task.area?.color ?? "#9ca3af",
              }}
            >
              <div className="font-medium">{task.title}</div>
              {task.scheduled_time && (
                <span className="text-muted-foreground">
                  {task.scheduled_time}
                </span>
              )}
              {task.estimated_minutes && (
                <span className="text-muted-foreground ml-2">
                  ({task.estimated_minutes} min)
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {DISPLAY_HOURS.map((hour) => {
            const hourEvents = timedEvents.filter(
              (e) => getEventHour(e) === hour
            );

            return (
              <div key={hour} className="contents">
                {/* Time label */}
                <div className="border-b border-r py-3 pr-2 text-right text-xs text-muted-foreground">
                  {String(hour).padStart(2, "0")}:00
                </div>

                {/* Slot */}
                <div
                  className="border-b min-h-[3.5rem] p-1 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => onSlotClick?.(date, hour)}
                >
                  <div className="space-y-1">
                    {hourEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={onEventClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
