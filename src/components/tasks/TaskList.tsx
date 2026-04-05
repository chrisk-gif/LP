"use client";

import { useState } from "react";
import { TaskItem, type TaskItemData } from "./TaskItem";

interface TaskListProps {
  tasks: TaskItemData[];
  onToggle: (id: string) => void;
  onSelect: (task: TaskItemData) => void;
}

export function TaskList({ tasks, onToggle, onSelect }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">Ingen oppgaver a vise</p>
        <p className="text-xs mt-1">
          Legg til en ny oppgave med feltet ovenfor
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
