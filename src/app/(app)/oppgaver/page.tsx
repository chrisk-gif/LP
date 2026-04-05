"use client";

import { useState, useMemo } from "react";
import { v4 as uuid } from "uuid";
import {
  Plus,
  ArrowUpDown,
  Filter,
  ListTodo,
  CalendarDays,
  AlertTriangle,
  Clock,
  Repeat,
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
import { AREA_DEFAULTS, type AreaSlug } from "@/lib/constants";
import { isOverdue, isToday, parseISO } from "@/lib/dates";

// ==========================================================================
// Demo data
// ==========================================================================

const TODAY = new Date().toISOString().split("T")[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const TOMORROW = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const NEXT_WEEK = new Date(Date.now() + 7 * 86400000)
  .toISOString()
  .split("T")[0];
const LAST_WEEK = new Date(Date.now() - 5 * 86400000)
  .toISOString()
  .split("T")[0];

const INITIAL_TASKS: TaskItemData[] = [
  {
    id: uuid(),
    title: "Ferdigstille prismatrise for Byasentunnelen",
    description:
      "Gjennomga alle enhetspriser og oppdater prismatrisen for byggherre.",
    status: "in_progress",
    priority: "critical",
    due_date: TODAY,
    estimated_minutes: 120,
    tags: ["tilbud", "prioritert"],
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: uuid(),
    title: "Sjekk status ytly.no nettside",
    description: "Verifiser at alle endringer pa nettsiden er deployet korrekt.",
    status: "todo",
    priority: "high",
    due_date: TODAY,
    estimated_minutes: 30,
    tags: ["nettside"],
    area: { name: "ytly.no", slug: "ytly", color: "#7c3aed" },
  },
  {
    id: uuid(),
    title: "Handle dagligvarer",
    description: "Melk, brod, gronnsaker, kylling.",
    status: "todo",
    priority: "low",
    due_date: TODAY,
    tags: ["handling"],
    area: { name: "Privat", slug: "privat", color: "#059669" },
  },
  {
    id: uuid(),
    title: "Sende faktura til Rogaland fylkeskommune",
    description: "Faktura for tilleggsarbeid januar-mars 2026.",
    status: "todo",
    priority: "high",
    due_date: TOMORROW,
    estimated_minutes: 45,
    tags: ["faktura"],
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: uuid(),
    title: "Oppdater manedlig budsjettsporing",
    description: "For inn alle transaksjoner for mars.",
    status: "todo",
    priority: "medium",
    due_date: LAST_WEEK,
    estimated_minutes: 60,
    tags: ["budsjett"],
    area: { name: "Okonomi", slug: "okonomi", color: "#d97706" },
  },
  {
    id: uuid(),
    title: "Bestille time hos tannlegen",
    status: "waiting",
    priority: "low",
    due_date: NEXT_WEEK,
    area: { name: "Privat", slug: "privat", color: "#059669" },
  },
  {
    id: uuid(),
    title: "Treningsprogram: Uke 14",
    description: "3x styrke, 2x loping, 1x mobilitet",
    status: "todo",
    priority: "medium",
    due_date: NEXT_WEEK,
    estimated_minutes: 360,
    is_recurring: true,
    tags: ["trening"],
    area: { name: "Trening", slug: "trening", color: "#dc2626" },
  },
  {
    id: uuid(),
    title: "Klargjore presentasjon for oppstartsmate",
    description: "PowerPoint for Byasentunnelen oppstartsmate med byggherre.",
    status: "todo",
    priority: "critical",
    due_date: YESTERDAY,
    estimated_minutes: 90,
    tags: ["presentasjon"],
    area: { name: "Asplan Viak", slug: "asplan-viak", color: "#2563eb" },
  },
  {
    id: uuid(),
    title: "Betale husleie",
    status: "done",
    priority: "high",
    due_date: YESTERDAY,
    area: { name: "Okonomi", slug: "okonomi", color: "#d97706" },
    tags: ["fast-utgift"],
    is_recurring: true,
  },
  {
    id: uuid(),
    title: "Ukentlig gjennomgang av innboks",
    status: "todo",
    priority: "medium",
    due_date: TOMORROW,
    estimated_minutes: 20,
    is_recurring: true,
    area: { name: "Privat", slug: "privat", color: "#059669" },
  },
];

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
    // created – just use the existing order (id based)
    return 0;
  });
}

// ==========================================================================
// Page component
// ==========================================================================

export default function OppgaverPage() {
  const [tasks, setTasks] = useState<TaskItemData[]>(INITIAL_TASKS);
  const [sortBy, setSortBy] = useState<SortKey>("priority");
  const [filterArea, setFilterArea] = useState<string>("alle");
  const [quickAdd, setQuickAdd] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItemData | null>(null);

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

  function handleToggle(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t
      )
    );
  }

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = quickAdd.trim();
    if (!title) return;
    setTasks((prev) => [
      {
        id: uuid(),
        title,
        status: "todo",
        priority: "medium",
        due_date: TODAY,
      },
      ...prev,
    ]);
    setQuickAdd("");
  }

  function handleFormSubmit(values: TaskFormValues) {
    const areaSlug = values.area_slug as AreaSlug;
    const area = areaSlug
      ? {
          name: AREA_DEFAULTS[areaSlug]?.name ?? areaSlug,
          slug: areaSlug,
          color: AREA_DEFAULTS[areaSlug]?.color ?? "#6b7280",
        }
      : null;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: values.title,
                description: values.description || null,
                priority: values.priority,
                due_date: values.due_date || null,
                scheduled_date: values.scheduled_date || null,
                scheduled_time: values.scheduled_time || null,
                estimated_minutes: values.estimated_minutes
                  ? parseInt(values.estimated_minutes, 10)
                  : null,
                tags: values.tags,
                area,
              }
            : t
        )
      );
    } else {
      const newTask: TaskItemData = {
        id: uuid(),
        title: values.title,
        description: values.description || null,
        status: "todo",
        priority: values.priority,
        due_date: values.due_date || null,
        scheduled_date: values.scheduled_date || null,
        scheduled_time: values.scheduled_time || null,
        estimated_minutes: values.estimated_minutes
          ? parseInt(values.estimated_minutes, 10)
          : null,
        tags: values.tags,
        area,
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setFormOpen(false);
    setEditingTask(null);
  }

  function handleSelect(task: TaskItemData) {
    setEditingTask(task);
    setFormOpen(true);
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Oppgaver</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tasks.filter((t) => t.status !== "done").length} aktive oppgaver
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
            {(Object.entries(AREA_DEFAULTS) as [AreaSlug, (typeof AREA_DEFAULTS)[AreaSlug]][]).map(
              ([slug, area]) => (
                <SelectItem key={slug} value={slug}>
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    {area.name}
                  </span>
                </SelectItem>
              )
            )}
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
