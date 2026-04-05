"use client";

import { useEffect, useCallback } from "react";
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
  Clock,
  ArrowRight,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

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

  function runCommand(command: () => void) {
    onOpenChange(false);
    command();
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Søk oppgaver, hendelser, prosjekter..." />
      <CommandList>
        <CommandEmpty>Ingen resultater funnet.</CommandEmpty>

        {/* Quick actions */}
        <CommandGroup heading="Hurtighandlinger">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                /* dispatch quick-add task */
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Ny oppgave
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                /* dispatch quick-add event */
              })
            }
          >
            <Calendar className="mr-2 h-4 w-4" />
            Ny hendelse
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                /* dispatch quick-add note */
              })
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Nytt notat
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                /* dispatch quick-add bill */
              })
            }
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Ny regning
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigasjon">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
            <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground" />
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/i-dag"))}
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            I dag
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/kalender"))}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Kalender
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/oppgaver"))}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Oppgaver
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/mal"))}>
            <Target className="mr-2 h-4 w-4" />
            Mål
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/prosjekter"))}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            Prosjekter
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/asplan-viak"))}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Asplan Viak
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/okonomi"))}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Økonomi
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/trening"))}
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            Trening
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/logg"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            Logg & Refleksjon
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/innboks"))}
          >
            <Inbox className="mr-2 h-4 w-4" />
            Innboks
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/assistent"))}
          >
            <Bot className="mr-2 h-4 w-4" />
            Assistent
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Recent */}
        <CommandGroup heading="Siste handlinger">
          <CommandItem>
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Ingen nylige handlinger
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
