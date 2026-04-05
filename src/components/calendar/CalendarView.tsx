"use client";

import { useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { nb } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/dates";
import { type CalendarEvent, type CalendarTask } from "./EventCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarViewProps {
  date: Date;
  events: CalendarEvent[];
  tasks: CalendarTask[];
  onSlotClick?: (date: Date, hour: number) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DISPLAY_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 - 22:00

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function getEventHour(event: CalendarEvent): number {
  return parseISO(event.start_time).getHours();
}

function getEventDurationHours(event: CalendarEvent): number {
  if (!event.end_time) return 1;
  const start = parseISO(event.start_time);
  const end = parseISO(event.end_time);
  return Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

function getEventMinuteOffset(event: CalendarEvent): number {
  return parseISO(event.start_time).getMinutes();
}

// ---------------------------------------------------------------------------
// Priority color map for tasks
// ---------------------------------------------------------------------------

const TASK_PRIORITY_BORDER: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#3b82f6",
  low: "#9ca3af",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalendarView({
  date,
  events,
  tasks,
  onSlotClick,
  onEventClick,
}: CalendarViewProps) {
  const weekDays = useMemo(() => getWeekDays(date), [date]);

  function eventsForDayHour(day: Date, hour: number): CalendarEvent[] {
    return events.filter((e) => {
      if (e.all_day) return false;
      const eventDate = parseISO(e.start_time);
      return isSameDay(eventDate, day) && eventDate.getHours() === hour;
    });
  }

  function allDayEventsForDay(day: Date): CalendarEvent[] {
    return events.filter(
      (e) => e.all_day && isSameDay(parseISO(e.start_time), day)
    );
  }

  function tasksForDayHour(day: Date, hour: number): CalendarTask[] {
    return tasks.filter((t) => {
      if (!t.scheduled_time || !t.scheduled_date) return false;
      const taskDate = parseISO(t.scheduled_date);
      const taskHour = parseInt(t.scheduled_time.split(":")[0], 10);
      return isSameDay(taskDate, day) && taskHour === hour;
    });
  }

  function deadlinesForDay(day: Date): CalendarTask[] {
    return tasks.filter(
      (t) =>
        t.due_date &&
        isSameDay(parseISO(t.due_date), day) &&
        t.status !== "done" &&
        !t.scheduled_time
    );
  }

  // Now indicator
  const nowHour = new Date().getHours();
  const nowMinutes = new Date().getMinutes();

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      {/* ---- Day headers ---- */}
      <div
        className="grid border-b"
        style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
      >
        {/* Empty top-left corner */}
        <div className="border-r" />

        {weekDays.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex flex-col items-center py-2 border-r last:border-r-0",
                today && "bg-primary/5"
              )}
            >
              <span className="text-xs text-muted-foreground capitalize">
                {format(day, "EEE", { locale: nb })}
              </span>
              <span
                className={cn(
                  "mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                  today && "bg-primary text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* ---- All-day row ---- */}
      {weekDays.some((d) => allDayEventsForDay(d).length > 0) && (
        <div
          className="grid border-b"
          style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
        >
          <div className="border-r px-1 py-1 text-[10px] text-muted-foreground text-right">
            Hele
            <br />
            dagen
          </div>
          {weekDays.map((day) => {
            const allDay = allDayEventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className="border-r last:border-r-0 p-0.5 space-y-0.5"
              >
                {allDay.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick?.(event)}
                    className="w-full rounded px-1.5 py-0.5 text-[11px] font-medium bg-blue-100 text-blue-800 truncate text-left dark:bg-blue-900/30 dark:text-blue-300"
                    style={
                      event.area?.color
                        ? { borderLeft: `3px solid ${event.area.color}` }
                        : undefined
                    }
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Deadline markers row ---- */}
      {weekDays.some((d) => deadlinesForDay(d).length > 0) && (
        <div
          className="grid border-b"
          style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
        >
          <div className="border-r px-1 py-1 text-[10px] text-muted-foreground text-right">
            Frister
          </div>
          {weekDays.map((day) => {
            const deadlines = deadlinesForDay(day);
            return (
              <div
                key={day.toISOString()}
                className="border-r last:border-r-0 p-0.5 space-y-0.5"
              >
                {deadlines.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 truncate"
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          TASK_PRIORITY_BORDER[task.priority] ?? "#9ca3af",
                      }}
                    />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Time grid ---- */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="grid"
          style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
        >
          {DISPLAY_HOURS.map((hour) => (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="border-b border-r py-3 pr-2 text-right text-[11px] text-muted-foreground relative">
                {String(hour).padStart(2, "0")}:00
              </div>

              {/* Day columns for this hour */}
              {weekDays.map((day) => {
                const hourEvents = eventsForDayHour(day, hour);
                const hourTasks = tasksForDayHour(day, hour);
                const today = isToday(day);
                const isCurrentHour = today && nowHour === hour;

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      "relative border-b border-r last:border-r-0 min-h-[3.5rem] p-0.5 cursor-pointer hover:bg-accent/20 transition-colors",
                      today && "bg-primary/[0.02]"
                    )}
                    onClick={() => onSlotClick?.(day, hour)}
                  >
                    {/* Current time indicator */}
                    {isCurrentHour && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 pointer-events-none"
                        style={{
                          top: `${(nowMinutes / 60) * 100}%`,
                        }}
                      >
                        <span className="absolute -left-1 -top-[3px] size-2 rounded-full bg-red-500" />
                      </div>
                    )}

                    {/* Events */}
                    {hourEvents.map((event) => {
                      const duration = getEventDurationHours(event);
                      const minuteOffset = getEventMinuteOffset(event);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          className={cn(
                            "absolute left-0.5 right-0.5 rounded-md border-l-[3px] px-1.5 py-0.5 text-[11px] leading-tight z-[5] overflow-hidden text-left",
                            "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300"
                          )}
                          style={{
                            top: `${(minuteOffset / 60) * 100}%`,
                            height: `${Math.min(duration * 100, 100)}%`,
                            minHeight: "1.5rem",
                            borderLeftColor: event.area?.color ?? undefined,
                          }}
                        >
                          <span className="font-medium block truncate">
                            {event.title}
                          </span>
                          <span className="opacity-70">
                            {formatTime(event.start_time)}
                          </span>
                        </button>
                      );
                    })}

                    {/* Scheduled tasks (lighter blocks) */}
                    {hourTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-md border-l-[3px] bg-accent/60 px-1.5 py-0.5 text-[11px] leading-tight"
                        style={{
                          borderLeftColor:
                            task.area?.color ??
                            TASK_PRIORITY_BORDER[task.priority] ??
                            "#9ca3af",
                        }}
                      >
                        <span className="font-medium block truncate">
                          {task.title}
                        </span>
                        {task.estimated_minutes && (
                          <span className="text-muted-foreground">
                            {task.estimated_minutes} min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
