"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const itemTypes = [
  { value: "task", label: "Oppgave", icon: CheckSquare },
  { value: "event", label: "Hendelse", icon: CalendarCheck },
  { value: "note", label: "Notat", icon: FileText },
  { value: "bill", label: "Regning", icon: CreditCard },
  { value: "workout", label: "Trening", icon: Dumbbell },
  { value: "inbox", label: "Innboks", icon: Inbox },
] as const;

interface Area {
  id: string;
  name: string;
  slug: string;
}

interface QuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function QuickAdd({ open, onOpenChange }: QuickAddProps) {
  const [type, setType] = useState<string>("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaId, setAreaId] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const supabase = createClient();

  // Fetch areas when dialog opens
  useEffect(() => {
    if (!open) return;
    async function fetchAreas() {
      setAreasLoading(true);
      try {
        const { data, error } = await supabase
          .from("areas")
          .select("id, name, slug")
          .order("name");
        if (error) throw error;
        setAreas(data ?? []);
      } catch (err) {
        console.error("Failed to fetch areas:", err);
      } finally {
        setAreasLoading(false);
      }
    }
    fetchAreas();
  }, [open]);

  function resetForm() {
    setType("task");
    setTitle("");
    setDescription("");
    setAreaId("");
    setDueDate(undefined);
    setStatus("idle");
    setErrorMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate area is selected for types that require it
    if (["task", "event"].includes(type) && !areaId) {
      setStatus("error");
      setErrorMessage("Velg et omrade for denne typen.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const trimmedTitle = title.trim();
      const trimmedDesc = description.trim() || undefined;

      switch (type) {
        case "task": {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: trimmedTitle,
              description: trimmedDesc ?? null,
              area_id: areaId,
              due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Kunne ikke opprette oppgave");
          }
          break;
        }

        case "event": {
          // Build start_time from dueDate, default to 09:00 today if no date selected
          const eventDate = dueDate ?? new Date();
          const startTime = new Date(eventDate);
          startTime.setHours(9, 0, 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(startTime.getHours() + 1);

          const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: trimmedTitle,
              description: trimmedDesc ?? null,
              area_id: areaId,
              start_time: startTime.toISOString(),
              end_time: endTime.toISOString(),
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Kunne ikke opprette hendelse");
          }
          break;
        }

        case "note": {
          const { error } = await supabase.from("notes").insert({
            title: trimmedTitle,
            content: trimmedDesc ?? null,
            area_id: areaId || null,
          });
          if (error) throw new Error(error.message);
          break;
        }

        case "bill": {
          const res = await fetch("/api/finance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: trimmedTitle,
              description: trimmedDesc ?? null,
              type: "bill",
              due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
            }),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Kunne ikke opprette regning");
          }
          break;
        }

        case "workout": {
          const { error } = await supabase.from("workout_sessions").insert({
            title: trimmedTitle,
            notes: trimmedDesc ?? null,
            session_date: dueDate
              ? format(dueDate, "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd"),
          });
          if (error) throw new Error(error.message);
          break;
        }

        case "inbox": {
          const { error } = await supabase.from("inbox_items").insert({
            title: trimmedTitle,
            raw_text: trimmedDesc ?? null,
          });
          if (error) throw new Error(error.message);
          break;
        }

        default:
          throw new Error(`Ukjent type: ${type}`);
      }

      setStatus("success");
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 600);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Noe gikk galt");
    }
  }

  const selectedType = itemTypes.find((t) => t.value === type);
  const TypeIcon = selectedType?.icon ?? CheckSquare;
  const requiresArea = ["task", "event"].includes(type);

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
                  onClick={() => {
                    setType(item.value);
                    setStatus("idle");
                    setErrorMessage("");
                  }}
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
            <Label>
              Omrade
              {requiresArea && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger>
                <SelectValue placeholder={areasLoading ? "Laster..." : "Velg omrade..."} />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
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

          {/* Feedback */}
          {status === "error" && errorMessage && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4 shrink-0" />
              Lagt til!
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
            <Button
              type="submit"
              disabled={!title.trim() || status === "submitting" || status === "success"}
            >
              {status === "submitting" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Legg til
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
