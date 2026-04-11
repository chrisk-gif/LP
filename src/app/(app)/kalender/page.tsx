"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarView } from "@/components/calendar/CalendarView";
import { MonthView } from "@/components/calendar/MonthView";
import { DayView } from "@/components/calendar/DayView";
import {
  EventCard,
  type CalendarEvent,
  type CalendarTask,
} from "@/components/calendar/EventCard";

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{ date?: Date; hour?: number }>({});
  const [viewEvent, setViewEvent] = useState<CalendarEvent | null>(null);

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

  // Deep-link: handled by EventDeepLinker component wrapped in Suspense below

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
    setCreateDefaults({ date, hour });
    setCreateDialogOpen(true);
  }

  function handleEventClick(event: CalendarEvent) {
    setViewEvent(event);
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

      {/* Create event dialog */}
      <CreateEventDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaults={createDefaults}
        onCreated={(newEvent) => {
          setEvents((prev) => [...prev, newEvent]);
          setCreateDialogOpen(false);
        }}
      />

      {/* View/edit event dialog */}
      <ViewEventDialog
        event={viewEvent}
        onClose={() => setViewEvent(null)}
        onUpdated={(updated) => {
          setEvents((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e))
          );
          setViewEvent(null);
        }}
        onDeleted={(id) => {
          setEvents((prev) => prev.filter((e) => e.id !== id));
          setViewEvent(null);
        }}
      />

      {/* Deep-link support: ?eventId=<uuid> opens event detail */}
      <Suspense fallback={null}>
        <EventDeepLinker events={events} onOpenEvent={setViewEvent} />
      </Suspense>
    </div>
  );
}

// ==========================================================================
// Deep-link handler (wrapped in Suspense in the parent)
// ==========================================================================

function EventDeepLinker({
  events,
  onOpenEvent,
}: {
  events: CalendarEvent[];
  onOpenEvent: (event: CalendarEvent) => void;
}) {
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (!eventId || handled.current) return;

    // First try: find in already-loaded events
    const found = events.find((e) => e.id === eventId);
    if (found) {
      onOpenEvent(found);
      handled.current = true;
      return;
    }

    // Second try: fetch the specific event by ID (handles events outside current range)
    async function fetchEventById() {
      try {
        const res = await fetch(`/api/events?id=${encodeURIComponent(eventId!)}`);
        if (!res.ok) return;
        const data = await res.json();
        // API may return array or single object
        const raw: ApiEvent | undefined = Array.isArray(data) ? data[0] : data;
        if (raw) {
          onOpenEvent(mapApiEvent(raw));
          handled.current = true;
        }
      } catch {
        // Deep-link fetch failure is non-critical
      }
    }

    fetchEventById();
  }, [searchParams, events, onOpenEvent]);

  return null;
}

// ==========================================================================
// Create event dialog
// ==========================================================================

interface AreaOption {
  id: string;
  name: string;
  slug: string;
}

function CreateEventDialog({
  open,
  onOpenChange,
  defaults,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: { date?: Date; hour?: number };
  onCreated: (event: CalendarEvent) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("meeting");
  const [areaId, setAreaId] = useState("");
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!open) return;
    async function loadAreas() {
      try {
        const res = await fetch("/api/areas");
        if (!res.ok) return;
        const data = await res.json();
        if (data) setAreas(data);
        if (data && data.length > 0 && !areaId) {
          const privat = data.find((a: AreaOption) => a.slug === "privat");
          setAreaId(privat?.id ?? data[0].id);
        }
      } catch {
        // areas remain empty
      }
    }
    loadAreas();
  }, [open]);

  useEffect(() => {
    if (open && defaults.date) {
      setStartDate(format(defaults.date, "yyyy-MM-dd"));
      if (defaults.hour != null) {
        const h = String(defaults.hour).padStart(2, "0");
        setStartTime(`${h}:00`);
        const endH = String(Math.min(defaults.hour + 1, 23)).padStart(2, "0");
        setEndTime(`${endH}:00`);
      }
    }
  }, [open, defaults]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Tittel er påkrevd");
      return;
    }
    if (!startDate || !startTime) {
      setFormError("Dato og starttid er påkrevd");
      return;
    }
    if (!areaId) {
      setFormError("Velg et område");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const startIso = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endIso = endTime
        ? new Date(`${startDate}T${endTime}:00`).toISOString()
        : new Date(new Date(startIso).getTime() + 3600000).toISOString();

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_id: areaId,
          title: title.trim(),
          description: description.trim() || null,
          event_type: eventType,
          start_time: startIso,
          end_time: endIso,
          location: location.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kunne ikke opprette hendelse");
      }

      const raw = await res.json();
      onCreated(mapApiEvent(raw));
      setTitle("");
      setDescription("");
      setEventType("meeting");
      setStartDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ny hendelse</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Tittel</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="F.eks. Møte med prosjektleder"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Møte</SelectItem>
                  <SelectItem value="deadline">Frist</SelectItem>
                  <SelectItem value="reminder">Påminnelse</SelectItem>
                  <SelectItem value="block">Fokustid</SelectItem>
                  <SelectItem value="personal">Personlig</SelectItem>
                  <SelectItem value="other">Annet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Område <span className="text-destructive">*</span></Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg område..." />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="event-date">Dato</Label>
              <Input
                id="event-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end">Slutt</Label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-location">Sted (valgfritt)</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="F.eks. Møterom 3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-desc">Beskrivelse (valgfritt)</Label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
              Opprett
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================================================
// View/edit event dialog
// ==========================================================================

function ViewEventDialog({
  event,
  onClose,
  onUpdated,
  onDeleted,
}: {
  event: CalendarEvent | null;
  onClose: () => void;
  onUpdated: (event: CalendarEvent) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setLocation(event.location ?? "");
      setEditing(false);
    }
  }, [event]);

  if (!event) return null;

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Feil ved oppdatering");
      const updated = await res.json();
      onUpdated(mapApiEvent(updated));
    } catch {
      // stay in edit mode
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id }),
      });
      if (!res.ok) throw new Error("Feil ved sletting");
      onDeleted(event.id);
    } catch {
      // stay open
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Rediger hendelse" : "Hendelse"}</DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tittel</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sted</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Beskrivelse</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={submitting}>
                Avbryt
              </Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin mr-2" />}
                Lagre
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {format(parseISO(event.start_time), "EEEE d. MMMM yyyy", { locale: nb })}
              </p>
              <p>
                {format(parseISO(event.start_time), "HH:mm", { locale: nb })}
                {event.end_time && ` \u2013 ${format(parseISO(event.end_time), "HH:mm", { locale: nb })}`}
              </p>
              {event.location && <p>Sted: {event.location}</p>}
              {event.description && <p className="mt-2">{event.description}</p>}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={submitting}>
                Slett
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Rediger
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
