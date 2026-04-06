"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
} from "date-fns";
import { nb } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Clock,
  Sun,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/CalendarView";
import { MonthView } from "@/components/calendar/MonthView";
import { DayView } from "@/components/calendar/DayView";
import {
  EventCard,
  type CalendarEvent,
  type CalendarTask,
} from "@/components/calendar/EventCard";
import { cn as _cn } from "@/lib/utils";
void _cn;

// ==========================================================================
// View types
// ==========================================================================

type ViewMode = "dag" | "uke" | "maned" | "liste";

const VIEW_ICONS: Record<ViewMode, React.ReactNode> = {
  dag: <Sun className="size-4" />,
  uke: <LayoutGrid className="size-4" />,
  maned: <CalendarIcon className="size-4" />,
  liste: <List className="size-4" />,
};

const VIEW_LABELS: Record<ViewMode, string> = {
  dag: "Dag",
  uke: "Uke",
  maned: "Maned",
  liste: "Liste",
};

// ==========================================================================
// Date range calculation
// ==========================================================================

interface DateRange {
  start: string; // ISO string
  end: string; // ISO string
}

function getDateRange(view: ViewMode, date: Date): DateRange {
  switch (view) {
    case "dag":
      return {
        start: startOfDay(date).toISOString(),
        end: endOfDay(date).toISOString(),
      };
    case "uke":
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }).toISOString(),
        end: endOfWeek(date, { weekStartsOn: 1 }).toISOString(),
      };
    case "maned":
      return {
        start: startOfMonth(date).toISOString(),
        end: endOfMonth(date).toISOString(),
      };
    case "liste":
      return {
        start: startOfDay(date).toISOString(),
        end: endOfDay(addDays(date, 13)).toISOString(),
      };
  }
}

// ==========================================================================
// API response mapping
// ==========================================================================

interface ApiEvent {
  id: string;
  title: string;
  description?: string | null;
  event_type: string;
  start_time: string;
  end_time?: string | null;
  all_day?: boolean;
  location?: string | null;
  color?: string;
  areas?: { name: string; slug: string; color: string } | null;
}

interface ApiTask {
  id: string;
  title: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority: string;
  status: string;
  estimated_minutes?: number | null;
  areas?: { name: string; slug: string; color: string } | null;
}

function mapApiEvent(raw: ApiEvent): CalendarEvent {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    event_type: raw.event_type,
    start_time: raw.start_time,
    end_time: raw.end_time,
    all_day: raw.all_day,
    location: raw.location,
    color: raw.color,
    area: raw.areas ?? null,
  };
}

function mapApiTask(raw: ApiTask): CalendarTask {
  return {
    id: raw.id,
    title: raw.title,
    scheduled_date: raw.scheduled_date,
    scheduled_time: raw.scheduled_time,
    due_date: raw.due_date,
    due_time: raw.due_time,
    priority: raw.priority,
    status: raw.status,
    estimated_minutes: raw.estimated_minutes,
    area: raw.areas ?? null,
  };
}

// ==========================================================================
// List view component
// ==========================================================================

function ListView({
  events,
  tasks,
  onEventClick,
}: {
  events: CalendarEvent[];
  tasks: CalendarTask[];
  onEventClick?: (event: CalendarEvent) => void;
}) {
  // Group events by date
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const dateKey = event.start_time.split("T")[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(event);
    }
    // Sort by date
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  return (
    <div className="space-y-6">
      {grouped.map(([dateStr, dayEvents]) => (
        <div key={dateStr}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 capitalize">
            {format(parseISO(dateStr), "EEEE d. MMMM", { locale: nb })}
          </h3>
          <div className="space-y-2">
            {dayEvents
              .sort(
                (a, b) =>
                  new Date(a.start_time).getTime() -
                  new Date(b.start_time).getTime()
              )
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
                />
              ))}
            {/* Tasks due this day */}
            {tasks
              .filter(
                (t) =>
                  t.due_date === dateStr ||
                  t.scheduled_date === dateStr
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="rounded-md border-l-[3px] bg-accent/50 px-3 py-2 text-xs"
                  style={{
                    borderLeftColor: task.area?.color ?? "#9ca3af",
                  }}
                >
                  <div className="font-medium">{task.title}</div>
                  <div className="flex gap-3 mt-0.5 text-muted-foreground">
                    {task.scheduled_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {task.scheduled_time}
                      </span>
                    )}
                    {task.estimated_minutes && (
                      <span>{task.estimated_minutes} min</span>
                    )}
                    {task.area && <span>{task.area.name}</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
      {grouped.length === 0 && tasks.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          Ingen hendelser i denne perioden
        </p>
      )}
    </div>
  );
}

// ==========================================================================
// Page component
// ==========================================================================

export default function KalenderPage() {
  const [view, setView] = useState<ViewMode>("uke");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute date range for the current view
  const dateRange = useMemo(
    () => getDateRange(view, currentDate),
    [view, currentDate]
  );

  // Fetch events and tasks when the date range changes
  const fetchData = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);

    try {
      const eventsParams = new URLSearchParams({
        start_after: range.start,
        start_before: range.end,
      });

      const tasksParams = new URLSearchParams({
        due_before: range.end.split("T")[0],
      });

      const [eventsRes, tasksRes] = await Promise.all([
        fetch(`/api/events?${eventsParams.toString()}`),
        fetch(`/api/tasks?${tasksParams.toString()}`),
      ]);

      if (!eventsRes.ok) {
        const errBody = await eventsRes.json().catch(() => null);
        throw new Error(
          errBody?.error ?? `Feil ved henting av hendelser (${eventsRes.status})`
        );
      }
      if (!tasksRes.ok) {
        const errBody = await tasksRes.json().catch(() => null);
        throw new Error(
          errBody?.error ?? `Feil ved henting av oppgaver (${tasksRes.status})`
        );
      }

      const [eventsData, tasksData] = await Promise.all([
        eventsRes.json() as Promise<ApiEvent[]>,
        tasksRes.json() as Promise<ApiTask[]>,
      ]);

      setEvents(eventsData.map(mapApiEvent));
      setTasks(tasksData.map(mapApiTask));
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Kunne ikke laste kalenderdata"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, fetchData]);

  // Navigation
  function goNext() {
    switch (view) {
      case "dag":
        setCurrentDate((d) => addDays(d, 1));
        break;
      case "uke":
        setCurrentDate((d) => addWeeks(d, 1));
        break;
      case "maned":
        setCurrentDate((d) => addMonths(d, 1));
        break;
      case "liste":
        setCurrentDate((d) => addWeeks(d, 1));
        break;
    }
  }

  function goPrev() {
    switch (view) {
      case "dag":
        setCurrentDate((d) => subDays(d, 1));
        break;
      case "uke":
        setCurrentDate((d) => subWeeks(d, 1));
        break;
      case "maned":
        setCurrentDate((d) => subMonths(d, 1));
        break;
      case "liste":
        setCurrentDate((d) => subWeeks(d, 1));
        break;
    }
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Date display
  function dateLabel(): string {
    switch (view) {
      case "dag":
        return format(currentDate, "EEEE d. MMMM yyyy", { locale: nb });
      case "uke": {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, "d. MMM", { locale: nb })} - ${format(weekEnd, "d. MMM yyyy", { locale: nb })}`;
      }
      case "maned":
        return format(currentDate, "MMMM yyyy", { locale: nb });
      case "liste":
        return format(currentDate, "MMMM yyyy", { locale: nb });
    }
  }

  // TODO: Open a create-event dialog when a time slot is clicked
  function handleSlotClick(date: Date, hour: number) {
    console.log("Create event at", date, hour);
  }

  // TODO: Open an event detail/edit dialog when an event is clicked
  function handleEventClick(event: CalendarEvent) {
    console.log("View event", event);
  }

  function handleDayClick(date: Date) {
    setCurrentDate(date);
    setView("dag");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kalender</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {dateLabel()}
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-1 rounded-lg border p-1">
          {(["dag", "uke", "maned", "liste"] as ViewMode[]).map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "ghost"}
              size="sm"
              onClick={() => setView(v)}
              className="gap-1.5"
            >
              {VIEW_ICONS[v]}
              <span className="hidden sm:inline">{VIEW_LABELS[v]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={goToday}>
          I dag
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={goPrev}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={goNext}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 mb-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fetchData(dateRange)}
          >
            Prov igjen
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Laster kalender...
          </span>
        </div>
      )}

      {/* Calendar views */}
      {!loading && !error && (
        <>
          {view === "uke" && (
            <CalendarView
              date={currentDate}
              events={events}
              tasks={tasks}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}

          {view === "maned" && (
            <MonthView
              date={currentDate}
              events={events}
              tasks={tasks}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
            />
          )}

          {view === "dag" && (
            <DayView
              date={currentDate}
              events={events}
              tasks={tasks}
              onSlotClick={handleSlotClick}
              onEventClick={handleEventClick}
            />
          )}

          {view === "liste" && (
            <ListView
              events={events}
              tasks={tasks}
              onEventClick={handleEventClick}
            />
          )}
        </>
      )}
    </div>
  );
}
