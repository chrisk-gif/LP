"use client";

import { useState } from "react";
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
import { TASK_PRIORITIES } from "@/lib/constants";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskFormValues {
  title: string;
  description: string;
  area_slug: string;
  priority: string;
  due_date: string;
  scheduled_date: string;
  scheduled_time: string;
  estimated_minutes: string;
  tags: string[];
  project_id: string;
  goal_id: string;
}

interface AreaOption {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface TaskFormProps {
  initialValues?: Partial<TaskFormValues>;
  areas?: AreaOption[];
  projects?: Array<{ id: string; title: string }>;
  goals?: Array<{ id: string; title: string }>;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Kritisk",
  high: "Hoy",
  medium: "Medium",
  low: "Lav",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TaskForm({
  initialValues,
  areas = [],
  projects = [],
  goals = [],
  onSubmit,
  onCancel,
  submitLabel = "Opprett oppgave",
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    area_slug: initialValues?.area_slug ?? "",
    priority: initialValues?.priority ?? "medium",
    due_date: initialValues?.due_date ?? "",
    scheduled_date: initialValues?.scheduled_date ?? "",
    scheduled_time: initialValues?.scheduled_time ?? "",
    estimated_minutes: initialValues?.estimated_minutes ?? "",
    tags: initialValues?.tags ?? [],
    project_id: initialValues?.project_id ?? "",
    goal_id: initialValues?.goal_id ?? "",
  });

  const [tagInput, setTagInput] = useState("");

  function update<K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !values.tags.includes(tag)) {
      update("tags", [...values.tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    update(
      "tags",
      values.tags.filter((t) => t !== tag)
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) return;
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-title">Tittel *</Label>
        <Input
          id="task-title"
          placeholder="Hva skal gjores?"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-desc">Beskrivelse</Label>
        <Textarea
          id="task-desc"
          placeholder="Valgfri beskrivelse..."
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
        />
      </div>

      {/* Area + Priority row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Omrade *</Label>
          <Select
            value={values.area_slug}
            onValueChange={(v) => update("area_slug", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Velg omrade" />
            </SelectTrigger>
            <SelectContent>
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Prioritet</Label>
          <Select
            value={values.priority}
            onValueChange={(v) => update("priority", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p] ?? p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-due">Frist</Label>
          <Input
            id="task-due"
            type="date"
            value={values.due_date}
            onChange={(e) => update("due_date", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-sched-date">Planlagt dato</Label>
          <Input
            id="task-sched-date"
            type="date"
            value={values.scheduled_date}
            onChange={(e) => update("scheduled_date", e.target.value)}
          />
        </div>
      </div>

      {/* Time + Duration row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-sched-time">Planlagt tidspunkt</Label>
          <Input
            id="task-sched-time"
            type="time"
            value={values.scheduled_time}
            onChange={(e) => update("scheduled_time", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-est">Estimert tid (min)</Label>
          <Input
            id="task-est"
            type="number"
            min={1}
            placeholder="f.eks. 30"
            value={values.estimated_minutes}
            onChange={(e) => update("estimated_minutes", e.target.value)}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <Label>Tagger</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Legg til tagg..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTag}>
            Legg til
          </Button>
        </div>
        {values.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {values.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Link to project / goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Koble til prosjekt</Label>
          <Select
            value={values.project_id}
            onValueChange={(v) => update("project_id", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ingen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ingen</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Koble til mal</Label>
          <Select
            value={values.goal_id}
            onValueChange={(v) => update("goal_id", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ingen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ingen</SelectItem>
              {goals.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Avbryt
        </Button>
        <Button type="submit" disabled={!values.title.trim() || !values.area_slug}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
