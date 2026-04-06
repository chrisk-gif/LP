"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  CheckSquare,
  Target,
  FolderKanban,
  Briefcase,
  Wallet,
  Dumbbell,
  BookOpen,
  Inbox,
  Bot,
  Plus,
  FileText,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickAdd?: (type: string) => void;
}

interface SearchResults {
  tasks: Array<{ id: string; title: string; status: string; priority: string }>;
  events: Array<{ id: string; title: string; event_type: string; start_time: string }>;
  projects: Array<{ id: string; title: string; status: string }>;
  notes: Array<{ id: string; title: string }>;
}

export function CommandPalette({ open, onOpenChange, onQuickAdd }: CommandPaletteProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Global Ctrl+K handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    },
    [open, onOpenChange]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults(null);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery || searchQuery.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data: SearchResults = await res.json();
          setResults(data);
        }
      } catch {
        // Search failure is non-critical
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  function runCommand(command: () => void) {
    onOpenChange(false);
    command();
  }

  function handleQuickAction(type: string) {
    runCommand(() => {
      if (onQuickAdd) {
        onQuickAdd(type);
      }
    });
  }

  const hasResults = results && (
    results.tasks.length > 0 ||
    results.events.length > 0 ||
    results.projects.length > 0 ||
    results.notes.length > 0
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Søk oppgaver, hendelser, prosjekter..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Søker...</span>
            </div>
          ) : searchQuery.length >= 2 ? (
            "Ingen resultater funnet."
          ) : (
            "Skriv minst 2 tegn for å søke..."
          )}
        </CommandEmpty>

        {/* Search results */}
        {hasResults && results && (
          <>
            {results.tasks.length > 0 && (
              <CommandGroup heading="Oppgaver">
                {results.tasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={`task-${task.id}-${task.title}`}
                    onSelect={() => runCommand(() => router.push(`/oppgaver?taskId=${task.id}`))}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    <span className="flex-1">{task.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {task.status === "done" ? "Fullført" : task.priority}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.events.length > 0 && (
              <CommandGroup heading="Hendelser">
                {results.events.map((event) => (
                  <CommandItem
                    key={event.id}
                    value={`event-${event.id}-${event.title}`}
                    onSelect={() => runCommand(() => router.push(`/kalender?eventId=${event.id}`))}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="flex-1">{event.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(event.start_time).toLocaleDateString("nb-NO")}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.projects.length > 0 && (
              <CommandGroup heading="Prosjekter">
                {results.projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project-${project.id}-${project.title}`}
                    onSelect={() => runCommand(() => router.push(`/prosjekter?projectId=${project.id}`))}
                  >
                    <FolderKanban className="mr-2 h-4 w-4" />
                    <span className="flex-1">{project.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {project.status === "active" ? "Aktiv" : project.status}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.notes.length > 0 && (
              <CommandGroup heading="Notater">
                {results.notes.map((note) => (
                  <CommandItem
                    key={note.id}
                    value={`note-${note.id}-${note.title}`}
                    onSelect={() => runCommand(() => router.push(`/logg?noteId=${note.id}`))}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="flex-1">{note.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />
          </>
        )}

        {/* Quick actions */}
        <CommandGroup heading="Hurtighandlinger">
          <CommandItem onSelect={() => handleQuickAction("task")}>
            <Plus className="mr-2 h-4 w-4" />
            Ny oppgave
          </CommandItem>
          <CommandItem onSelect={() => handleQuickAction("event")}>
            <Calendar className="mr-2 h-4 w-4" />
            Ny hendelse
          </CommandItem>
          <CommandItem onSelect={() => handleQuickAction("note")}>
            <FileText className="mr-2 h-4 w-4" />
            Nytt notat
          </CommandItem>
          <CommandItem onSelect={() => handleQuickAction("bill")}>
            <CreditCard className="mr-2 h-4 w-4" />
            Ny regning
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigasjon">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
            <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/idag"))}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            I dag
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/kalender"))}>
            <Calendar className="mr-2 h-4 w-4" />
            Kalender
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/oppgaver"))}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Oppgaver
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/maal"))}>
            <Target className="mr-2 h-4 w-4" />
            Mål
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/prosjekter"))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            Prosjekter
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/asplan-viak"))}>
            <Briefcase className="mr-2 h-4 w-4" />
            Asplan Viak
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/okonomi"))}>
            <Wallet className="mr-2 h-4 w-4" />
            Økonomi
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/trening"))}>
            <Dumbbell className="mr-2 h-4 w-4" />
            Trening
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/logg"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            Logg & Refleksjon
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/innboks"))}>
            <Inbox className="mr-2 h-4 w-4" />
            Innboks
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/assistent"))}>
            <Bot className="mr-2 h-4 w-4" />
            Assistent
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
