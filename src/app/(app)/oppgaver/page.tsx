"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus,
  ArrowUpDown,
  Filter,
  ListTodo,
  CalendarDays,
  AlertTriangle,
  Clock,
  Repeat,
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm, type TaskFormValues } from "@/components/tasks/TaskForm";
import type { TaskItemData } from "@/components/tasks/TaskItem";
import { isOverdue, isToday, parseISO } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";

// ==========================================================================
// Types
// ==========================================================================

interface Area {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface ProjectOption {
  id: string;
  title: string;
}

interface GoalOption {
  id: string;
  title: string;
}

// ==========================================================================
// Sort helpers
// ==========================================================================

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

type SortKey = "priority" | "due_date" | "created";

function sortTasks(tasks: TaskItemData[], key: SortKey): TaskItemData[] {
  return [...tasks].sort((a, b) => {
    if (key === "priority") {
      return (
        (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
      );
    }
    if (key === "due_date") {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }
    // created - use the existing order
    return 0;
  });
}

// ==========================================================================
// API helpers
// ==========================================================================

async function fetchTasks(): Promise<TaskItemData[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error("Kunne ikke hente oppgaver");
  const data = await res.json();
  // Map the joined `areas` relation to the flat `area` shape TaskItemData expects
  return data.map((t: Record<string, unknown>) => ({
    ...t,
    area: t.areas ?? null,
  }));
}

async function createTask(body: Record<string, unknown>): Promise<TaskItemData> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Kunne ikke opprette oppgave"
    );
  }
  const t = await res.json();
  return { ...t, area: t.areas ?? null };
}

async function patchTask(
  id: string,
  body: Record<string, unknown>
): Promise<TaskItemData> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Kunne ikke oppdatere oppgave"
    );
  }
  const t = await res.json();
  return { ...t, area: t.areas ?? null };
}

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Kunne ikke slette oppgave");
}

// ==========================================================================
// Page component
// ==========================================================================

export default function OppgaverPage() {
  const [tasks, setTasks] = useState<TaskItemData[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("priority");
  const [filterArea, setFilterArea] = useState<string>("alle");
  const [quickAdd, setQuickAdd] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItemData | null>(null);

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, []);

  const loadAreas = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("areas")
        .select("id, name, slug, color")
        .order("sort_order");
      if (data) setAreas(data);
    } catch (err) {
      console.error("Failed to load areas:", err);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("id, title")
        .order("title");
      if (data) setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("goals")
        .select("id, title")
        .order("title");
      if (data) setGoals(data);
    } catch (err) {
      console.error("Failed to load goals:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([loadTasks(), loadAreas(), loadProjects(), loadGoals()]);
      setLoading(false);
    }
    init();
  }, [loadTasks, loadAreas, loadProjects, loadGoals]);

  // -----------------------------------------------------------------------
  // Derived lists
  // -----------------------------------------------------------------------

  function filtered(list: TaskItemData[]) {
    let result = list;
    if (filterArea !== "alle") {
      result = result.filter((t) => t.area?.slug === filterArea);
    }
    return sortTasks(result, sortBy);
  }

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done" && t.status !== "archived"),
    [tasks]
  );
  const allTasks = useMemo(() => filtered(tasks), [tasks, sortBy, filterArea]);
  const todayTasks = useMemo(
    () =>
      filtered(
        tasks.filter((t) => t.due_date && isToday(parseISO(t.due_date)))
      ),
    [tasks, sortBy, filterArea]
  );
  const overdueTasks = useMemo(
    () =>
      filtered(
        tasks.filter(
          (t) =>
            t.due_date && isOverdue(t.due_date) && t.status !== "done"
        )
      ),
    [tasks, sortBy, filterArea]
  );
  const waitingTasks = useMemo(
    () => filtered(tasks.filter((t) => t.status === "waiting")),
    [tasks, sortBy, filterArea]
  );
  const recurringTasks = useMemo(
    () => filtered(tasks.filter((t) => t.is_recurring)),
    [tasks, sortBy, filterArea]
  );

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newStatus = task.status === "done" ? "todo" : "done";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await patchTask(id, { status: newStatus });
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: task.status } : t))
      );
    }
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickAdd.trim();
    if (!title) return;

    // Use the first area as a default, or the filtered area
    const defaultArea =
      filterArea !== "alle"
        ? areas.find((a) => a.slug === filterArea)
        : areas[0];

    if (!defaultArea) {
      console.error("No area available for quick add");
      return;
    }

    setQuickAdd("");

    try {
      const newTask = await createTask({
        title,
        area_id: defaultArea.id,
        status: "todo",
        priority: "medium",
        due_date: new Date().toISOString().split("T")[0],
      });
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error("Quick add failed:", err);
    }
  }

  async function handleFormSubmit(values: TaskFormValues) {
    // Find the area by slug to get its UUID
    const area = areas.find((a) => a.slug === values.area_slug);
    if (!area) {
      console.error("No area selected");
      return;
    }

    const payload: Record<string, unknown> = {
      title: values.title,
      description: values.description || null,
      area_id: area.id,
      priority: values.priority,
      due_date: values.due_date || null,
      scheduled_date: values.scheduled_date || null,
      scheduled_time: values.scheduled_time || null,
      estimated_minutes: values.estimated_minutes
        ? parseInt(values.estimated_minutes, 10)
        : null,
      tags: values.tags,
      project_id:
        values.project_id && values.project_id !== "none"
          ? values.project_id
          : null,
      goal_id:
        values.goal_id && values.goal_id !== "none" ? values.goal_id : null,
    };

    try {
      if (editingTask) {
        const updated = await patchTask(editingTask.id, payload);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updated : t))
        );
      } else {
        const newTask = await createTask(payload);
        setTasks((prev) => [newTask, ...prev]);
      }

      setFormOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Form submit failed:", err);
    }
  }

  function handleSelect(task: TaskItemData) {
    setEditingTask(task);
    setFormOpen(true);
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Oppgaver</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTasks.length} aktive oppgaver
          </p>
        </div>
        <Button onClick={() => { setEditingTask(null); setFormOpen(true); }}>
          <Plus className="size-4" />
          Ny oppgave
        </Button>
      </div>

      {/* Quick add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2 mb-6">
        <Input
          placeholder="Hurtiglegg til oppgave... trykk Enter"
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" size="icon" disabled={!quickAdd.trim()}>
          <Plus className="size-4" />
        </Button>
      </form>

      {/* Toolbar: filter + sort */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="size-4" />
          <span>Omrade:</span>
        </div>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle omrader</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.slug} value={area.slug}>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  {area.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
          <ArrowUpDown className="size-4" />
          <span>Sorter:</span>
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortKey)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Prioritet</SelectItem>
            <SelectItem value="due_date">Frist</SelectItem>
            <SelectItem value="created">Opprettet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="alle">
        <TabsList>
          <TabsTrigger value="alle" className="gap-1.5">
            <ListTodo className="size-4" />
            Alle
          </TabsTrigger>
          <TabsTrigger value="idag" className="gap-1.5">
            <CalendarDays className="size-4" />
            I dag
            {todayTasks.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                {todayTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="forfalt" className="gap-1.5">
            <AlertTriangle className="size-4" />
            Forfalt
            {overdueTasks.length > 0 && (
              <span className="ml-1 rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                {overdueTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ventende" className="gap-1.5">
            <Clock className="size-4" />
            Ventende
          </TabsTrigger>
          <TabsTrigger value="gjentakende" className="gap-1.5">
            <Repeat className="size-4" />
            Gjentakende
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="alle">
            <TaskList
              tasks={allTasks}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          </TabsContent>
          <TabsContent value="idag">
            <TaskList
              tasks={todayTasks}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          </TabsContent>
          <TabsContent value="forfalt">
            <TaskList
              tasks={overdueTasks}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          </TabsContent>
          <TabsContent value="ventende">
            <TaskList
              tasks={waitingTasks}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          </TabsContent>
          <TabsContent value="gjentakende">
            <TaskList
              tasks={recurringTasks}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTask(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Rediger oppgave" : "Ny oppgave"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            key={editingTask?.id ?? "new"}
            areas={areas}
            projects={projects}
            goals={goals}
            initialValues={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description ?? "",
                    area_slug: editingTask.area?.slug ?? "",
                    priority: editingTask.priority,
                    due_date: editingTask.due_date ?? "",
                    scheduled_date: editingTask.scheduled_date ?? "",
                    scheduled_time: editingTask.scheduled_time ?? "",
                    estimated_minutes: editingTask.estimated_minutes?.toString() ?? "",
                    tags: editingTask.tags ?? [],
                    project_id: editingTask.project_id ?? "",
                    goal_id: editingTask.goal_id ?? "",
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormOpen(false);
              setEditingTask(null);
            }}
            submitLabel={editingTask ? "Lagre endringer" : "Opprett oppgave"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
