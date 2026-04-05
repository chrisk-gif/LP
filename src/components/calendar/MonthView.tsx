"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EventCard, type CalendarEvent, type CalendarTask } from "./EventCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WEEKDAY_NAMES = ["Man", "Tir", "Ons", "Tor", "Fre", "Lor", "Son"];

function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days: Date[] = [];
  let current = start;
  while (current <= end) {
    days.push(current);
    current = addDays(current, 1);
  }
  return days;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MonthView({
  date,
  events,
  tasks,
  onDayClick,
  onEventClick,
}: MonthViewProps) {
  const days = useMemo(() => getMonthDays(date), [date]);

  function eventsForDay(day: Date): CalendarEvent[] {
    return events.filter((e) => isSameDay(parseISO(e.start_time), day));
  }

  function tasksForDay(day: Date): CalendarTask[] {
    return tasks.filter(
      (t) =>
        (t.due_date && isSameDay(parseISO(t.due_date), day)) ||
        (t.scheduled_date && isSameDay(parseISO(t.scheduled_date), day))
    );
  }

  return (
    <div className="flex flex-col">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 flex-1">
        {days.map((day) => {
          const dayEvents = eventsForDay(day);
          const dayTasks = tasksForDay(day);
          const inMonth = isSameMonth(day, date);
          const today = isToday(day);
          const hasDeadline = dayTasks.some(
            (t) => t.due_date && isSameDay(parseISO(t.due_date), day)
          );

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[5.5rem] border-b border-r p-1 cursor-pointer hover:bg-accent/30 transition-colors",
                !inMonth && "bg-muted/30"
              )}
              onClick={() => onDayClick?.(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between px-1">
                <span
                  className={cn(
                    "text-xs font-medium",
                    !inMonth && "text-muted-foreground/50",
                    today &&
                      "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {hasDeadline && (
                  <span className="size-1.5 rounded-full bg-red-500" />
                )}
              </div>

              {/* Events (show up to 3) */}
              <div className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact
                    onClick={onEventClick}
                  />
                ))}
                {dayTasks.slice(0, 2 - Math.min(dayEvents.length, 2)).map((task) => (
                  <div
                    key={task.id}
                    className="rounded px-1 py-0.5 text-[11px] leading-tight bg-accent/60 border-l-2 truncate"
                    style={{
                      borderLeftColor: task.area?.color ?? "#9ca3af",
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {dayEvents.length + dayTasks.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1">
                    +{dayEvents.length + dayTasks.length - 2} til
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
