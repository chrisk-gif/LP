"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Target,
  Clock,
  ListTodo,
  StickyNote,
  Sparkles,
  ArrowLeft,
  GripVertical,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  estimated_minutes: number | null;
  sort_order: number;
  areas: { name: string; slug: string; color: string } | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string | null;
  areas: { name: string; slug: string; color: string } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const typeColors: Record<string, string> = {
  meeting: "border-l-purple-500 bg-purple-50 dark:bg-purple-950/30",
  deadline: "border-l-red-500 bg-red-50 dark:bg-red-950/30",
  reminder: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
  block: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30",
  personal: "border-l-green-500 bg-green-50 dark:bg-green-950/30",
  other: "border-l-gray-400 bg-gray-50 dark:bg-gray-950/30",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-600",
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-blue-400",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function todayStartISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function todayEndISO(): string {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationMinutes(start: string, end: string): number {
  return Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const today = todayISO();

      const [tasksRes, overdueRes, eventsRes] = await Promise.all([
        fetch(`/api/tasks?scheduled_date=${today}`),
        fetch(`/api/tasks?due_before=${today}&status=todo`),
        fetch(
          `/api/events?start_after=${encodeURIComponent(todayStartISO())}&start_before=${encodeURIComponent(todayEndISO())}`
        ),
      ]);

      if (!tasksRes.ok || !overdueRes.ok || !eventsRes.ok) {
        throw new Error("Kunne ikke hente data");
      }

      const [tasksData, overdueData, eventsData]: [Task[], Task[], CalendarEvent[]] =
        await Promise.all([tasksRes.json(), overdueRes.json(), eventsRes.json()]);

      setTasks(tasksData);
      // Filter out tasks that are already scheduled for today (avoid duplicates)
      // and exclude done tasks
      const overdueFiltered = overdueData.filter(
        (t) => t.scheduled_date !== today && t.status !== "done"
      );
      setOverdueTasks(overdueFiltered);
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    // Optimistic update
    const updateList = (list: Task[]) =>
      list.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTasks(updateList);
    setOverdueTasks(updateList);

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Feil ved oppdatering");
    } catch {
      // Revert on error
      const revertList = (list: Task[]) =>
        list.map((t) => (t.id === id ? { ...t, status: currentStatus } : t));
      setTasks(revertList);
      setOverdueTasks(revertList);
    }
  };

  // Derived data
  const allTodayTasks = [...tasks, ...overdueTasks];
  const focusItems = allTodayTasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    })
    .slice(0, 3);

  const unscheduledTasks = tasks.filter(
    (t) => !t.scheduled_time && t.status !== "done"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          Prøv igjen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">I dag</h1>
            <p className="text-muted-foreground mt-0.5 capitalize">
              {getTodayFormatted()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Hva er viktigst?
          </Button>
          <Button size="sm" className="gap-1.5">
            <Target className="h-3.5 w-3.5" />
            Plan min dag
          </Button>
        </div>
      </header>

      {/* Top 3 Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            Topp 3 fokus i dag
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {focusItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Ingen oppgaver planlagt for i dag. Legg til oppgaver for å komme i gang.
            </p>
          ) : (
            focusItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => toggleTask(item.id, item.status)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                    item.status === "done"
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {item.status === "done" ? "\u2713" : index + 1}
                </div>
                <span
                  className={`text-sm ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.title}
                </span>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Overdue tasks notice */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              Forfalte oppgaver ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id, task.status)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    task.status === "done"
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {task.status === "done" && (
                    <span className="text-xs">{"\u2713"}</span>
                  )}
                </div>
                <span
                  className={`text-sm flex-1 ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-xs text-red-500">
                    Frist: {new Date(task.due_date).toLocaleDateString("nb-NO")}
                  </span>
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Two-column layout: Schedule + Sidebar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Time-blocked schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Dagsplan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Ingen hendelser planlagt for i dag.
              </p>
            ) : (
              events.map((event) => {
                const colorClass =
                  typeColors[event.event_type] ?? typeColors.other;
                const duration = durationMinutes(event.start_time, event.end_time);

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 rounded-md border-l-4 p-3 ${colorClass}`}
                  >
                    <div className="w-12 shrink-0">
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatTime(event.start_time)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {duration > 0 ? `${duration} min` : ""}
                        {event.location ? ` • ${event.location}` : ""}
                      </p>
                    </div>
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 cursor-grab" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Sidebar: unscheduled + notes */}
        <div className="flex flex-col gap-4">
          {/* Unscheduled tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTodo className="h-4 w-4 text-primary" />
                Uplanlagte oppgaver
                <Badge variant="secondary" className="ml-1 text-xs">
                  {unscheduledTasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {unscheduledTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Alle oppgaver er planlagt.
                </p>
              ) : (
                unscheduledTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${priorityColors[task.priority] ?? priorityColors.medium}`}
                    />
                    <span className="text-sm truncate">{task.title}</span>
                  </div>
                ))
              )}
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1">
                <Plus className="h-3.5 w-3.5" />
                Legg til oppgave
              </button>
            </CardContent>
          </Card>

          {/* Day notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <StickyNote className="h-4 w-4 text-primary" />
                Dagens notater
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-md border-0 bg-muted/50 p-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[120px]"
                placeholder="Skriv notater for dagen..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
