"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  CalendarIcon,
  CheckSquare,
  CalendarCheck,
  FileText,
  CreditCard,
  Dumbbell,
  Inbox,
} from "lucide-react";

const itemTypes = [
  { value: "task", label: "Oppgave", icon: CheckSquare },
  { value: "event", label: "Hendelse", icon: CalendarCheck },
  { value: "note", label: "Notat", icon: FileText },
  { value: "bill", label: "Regning", icon: CreditCard },
  { value: "workout", label: "Trening", icon: Dumbbell },
  { value: "inbox", label: "Innboks", icon: Inbox },
] as const;

const areas = [
  { value: "asplan-viak", label: "Asplan Viak" },
  { value: "ytly", label: "ytly.no" },
  { value: "privat", label: "Privat" },
  { value: "trening", label: "Trening" },
  { value: "okonomi", label: "Økonomi" },
] as const;

interface QuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAdd({ open, onOpenChange }: QuickAddProps) {
  const [type, setType] = useState<string>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  function resetForm() {
    setType("task");
    setTitle("");
    setDescription("");
    setArea("");
    setDueDate(undefined);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    // TODO: dispatch to appropriate API based on type
    const payload = {
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      area: area || undefined,
      due_date: dueDate?.toISOString() || undefined,
    };

    console.log("Quick add:", payload);

    resetForm();
    onOpenChange(false);
  }

  const selectedType = itemTypes.find((t) => t.value === type);
  const TypeIcon = selectedType?.icon ?? CheckSquare;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) resetForm();
        onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5" />
            Legg til nytt element
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="flex flex-wrap gap-1.5">
            {itemTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.value}
                  type="button"
                  variant={type === item.value ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setType(item.value)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="quick-add-title">Tittel</Label>
            <Input
              id="quick-add-title"
              placeholder={`Ny ${selectedType?.label.toLowerCase() ?? "oppgave"}...`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description (only for task/note/inbox) */}
          {["task", "note", "inbox"].includes(type) && (
            <div className="space-y-2">
              <Label htmlFor="quick-add-desc">Beskrivelse (valgfritt)</Label>
              <Textarea
                id="quick-add-desc"
                placeholder="Legg til detaljer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Area selector */}
          <div className="space-y-2">
            <Label>Område</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger>
                <SelectValue placeholder="Velg område..." />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due date */}
          {["task", "event", "bill"].includes(type) && (
            <div className="space-y-2">
              <Label>Frist / Dato</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate
                      ? format(dueDate, "PPP", { locale: nb })
                      : "Velg dato..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setCalendarOpen(false);
                    }}
                    locale={nb}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Legg til
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
