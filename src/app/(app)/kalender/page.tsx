"use client";

import { useState, useMemo } from "react";
import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
  isSameDay,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/calendar/CalendarView";
import { MonthView } from "@/components/calendar/MonthView";
import { DayView } from "@/components/calendar/DayView";
import { EventCard, type CalendarEvent, type CalendarTask } from "@/components/calendar/EventCard";
import { formatTime, formatDate, formatRelative } from "@/lib/dates";
import { cn } from "@/lib/utils";

// ==========================================================================
// Demo data
// ==========================================================================

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());

function dayAt(offset: number): Date {
  return addDays(TODAY, offset);
}

function isoAt(offset: number, hour: number, min = 0): string {
  const d = dayAt(offset);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Mote med byggherre",
    description: "Statusmote Byasentunnelen med Nye Veier.",
    event_type: "meeting",
    start_time: isoAt(0, 9, 0),
    end_time: isoAt(0, 10, 30),
    location: "Teams",
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: "evt-2",
    title: "Treningsokt: Styrke",
    description: "Overkropp + core.",
    event_type: "workout",
    start_time: isoAt(0, 17, 0),
    end_time: isoAt(0, 18, 15),
    location: "SATS Trondheim",
    area: { name: "Trening", slug: "trening", color: "#dc2626" },
  },
  {
    id: "evt-3",
    title: "Lunsj med kollega",
    description: "Diskutere nytt prosjekt.",
    event_type: "personal",
    start_time: isoAt(1, 11, 30),
    end_time: isoAt(1, 12, 30),
    location: "Kafeteria",
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: "evt-4",
    title: "Prosjektgjennomgang Div. 40",
    event_type: "meeting",
    start_time: isoAt(1, 13, 0),
    end_time: isoAt(1, 14, 0),
    location: "Moterom A3",
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: "evt-5",
    title: "Lopetur: Intervaller",
    event_type: "workout",
    start_time: isoAt(2, 6, 30),
    end_time: isoAt(2, 7, 30),
    area: { name: "Trening", slug: "trening", color: "#dc2626" },
  },
  {
    id: "evt-6",
    title: "Fokusokt: Tilbudsskriving",
    event_type: "focus_block",
    start_time: isoAt(2, 8, 0),
    end_time: isoAt(2, 11, 0),
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: "evt-7",
    title: "Middag med venner",
    event_type: "personal",
    start_time: isoAt(3, 19, 0),
    end_time: isoAt(3, 22, 0),
    location: "Baklandet Skydsstation",
    area: { name: "Privat", slug: "privat", color: "#059669" },
  },
  {
    id: "evt-8",
    title: "ytly.no strategimote",
    event_type: "meeting",
    start_time: isoAt(4, 10, 0),
    end_time: isoAt(4, 11, 0),
    location: "Google Meet",
    area: { name: "ytly.no", slug: "ytly", color: "#7c3aed" },
  },
  {
    id: "evt-9",
    title: "Legetime",
    event_type: "personal",
    start_time: isoAt(5, 14, 0),
    end_time: isoAt(5, 14, 30),
    location: "Trondheim legesenter",
    area: { name: "Privat", slug: "privat", color: "#059669" },
  },
];

const DEMO_TASKS: CalendarTask[] = [
  {
    id: "task-c1",
    title: "Ferdigstille prismatrise for Byasentunnelen",
    due_date: dayAt(0).toISOString().split("T")[0],
    scheduled_date: dayAt(0).toISOString().split("T")[0],
    scheduled_time: "14:00",
    priority: "critical",
    status: "in_progress",
    estimated_minutes: 120,
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: "task-c2",
    title: "Sjekk status ytly.no nettside",
    due_date: dayAt(0).toISOString().split("T")[0],
    priority: "high",
    status: "todo",
    estimated_minutes: 30,
    area: { name: "ytly.no", slug: "ytly", color: "#7c3aed" },
  },
  {
    id: "task-c3",
    title: "Sende faktura til Rogaland fylkeskommune",
    due_date: dayAt(1).toISOString().split("T")[0],
    scheduled_date: dayAt(1).toISOString().split("T")[0],
    scheduled_time: "09:00",
    priority: "high",
    status: "todo",
    estimated_minutes: 45,
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: "task-c4",
    title: "Oppdater manedlig budsjettsporing",
    due_date: dayAt(-5).toISOString().split("T")[0],
    priority: "medium",
    status: "todo",
    estimated_minutes: 60,
    area: { name: "Okonomi", slug: "okonomi", color: "#d97706" },
  },
  {
    id: "task-c5",
    title: "Treningsprogram: Uke 14",
    due_date: dayAt(7).toISOString().split("T")[0],
    priority: "medium",
    status: "todo",
    estimated_minutes: 360,
    area: { name: "Trening", slug: "trening", color: "#dc2626" },
  },
];

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
      {grouped.length === 0 && (
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

  function handleSlotClick(date: Date, hour: number) {
    // Placeholder: in production this would open a create event dialog
    console.log("Create event at", date, hour);
  }

  function handleEventClick(event: CalendarEvent) {
    // Placeholder: in production this would open event details
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

      {/* Calendar views */}
      {view === "uke" && (
        <CalendarView
          date={currentDate}
          events={DEMO_EVENTS}
          tasks={DEMO_TASKS}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      )}

      {view === "maned" && (
        <MonthView
          date={currentDate}
          events={DEMO_EVENTS}
          tasks={DEMO_TASKS}
          onDayClick={handleDayClick}
          onEventClick={handleEventClick}
        />
      )}

      {view === "dag" && (
        <DayView
          date={currentDate}
          events={DEMO_EVENTS}
          tasks={DEMO_TASKS}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      )}

      {view === "liste" && (
        <ListView
          events={DEMO_EVENTS}
          tasks={DEMO_TASKS}
          onEventClick={handleEventClick}
        />
      )}
    </div>
  );
}
