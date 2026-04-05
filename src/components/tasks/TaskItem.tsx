"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatRelative, isOverdue } from "@/lib/dates";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  CalendarDays,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskItemData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  due_time?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  estimated_minutes?: number | null;
  is_recurring?: boolean;
  tags?: string[];
  area?: { name: string; slug: string; color: string } | null;
  project_id?: string | null;
  goal_id?: string | null;
}

interface TaskItemProps {
  task: TaskItemData;
  onToggle: (id: string) => void;
  onClick: (task: TaskItemData) => void;
}

// ---------------------------------------------------------------------------
// Priority helpers
// ---------------------------------------------------------------------------

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Kritisk",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  },
  high: {
    label: "Hoy",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  },
  medium: {
    label: "Medium",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  low: {
    label: "Lav",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800/60 dark:text-gray-400",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TaskItem({ task, onToggle, onClick }: TaskItemProps) {
  const isDone = task.status === "done";
  const overdue = task.due_date ? isOverdue(task.due_date) : false;
  const prio = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(task);
        }
      }}
      onClick={() => onClick(task)}
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer",
        isDone && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        aria-label={isDone ? "Marker som ufullfort" : "Marker som fullfort"}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {isDone ? (
          <CheckCircle2 className="size-5 text-green-500" />
        ) : (
          <Circle className="size-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isDone && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Area badge with color dot */}
          {task.area && (
            <Badge variant="outline" className="gap-1.5 text-xs font-normal">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: task.area.color }}
              />
              {task.area.name}
            </Badge>
          )}

          {/* Priority badge */}
          <Badge variant="secondary" className={cn("text-xs", prio.className)}>
            {prio.label}
          </Badge>

          {/* Tags */}
          {task.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}

          {/* Estimated time */}
          {task.estimated_minutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {task.estimated_minutes} min
            </span>
          )}

          {/* Recurring indicator */}
          {task.is_recurring && (
            <span className="text-xs text-muted-foreground">
              <AlertTriangle className="size-3 inline mr-0.5" />
              Gjentakende
            </span>
          )}
        </div>
      </div>

      {/* Due date */}
      {task.due_date && (
        <div
          className={cn(
            "shrink-0 flex items-center gap-1 text-xs",
            overdue && !isDone
              ? "text-red-600 font-medium dark:text-red-400"
              : "text-muted-foreground"
          )}
        >
          <CalendarDays className="size-3.5" />
          {formatRelative(task.due_date)}
        </div>
      )}
    </div>
  );
}
