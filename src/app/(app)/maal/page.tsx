"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Target, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Area {
  id: string;
  name: string;
  color: string | null;
  slug: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  horizon: string;
  status: string;
  target_date: string | null;
  current_progress: number;
  why_it_matters: string | null;
  area_id: string;
  areas: Area;
}

const horizonLabels: Record<string, string> = {
  "short-term": "Kortsiktig",
  monthly: "Månedlig",
  quarterly: "Kvartalsvis",
  yearly: "Årlig",
  "long-term": "Langsiktig",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("goals")
        .select("*, areas(id, name, color, slug)")
        .order("target_date");

      if (fetchError) {
        setError("Kunne ikke hente mål: " + fetchError.message);
        setLoading(false);
        return;
      }

      setGoals((data as unknown as Goal[]) ?? []);

      // Also fetch areas for the create dialog
      const { data: areasData } = await supabase
        .from("areas")
        .select("id, name, color, slug")
        .order("name");
      setAreas((areasData as Area[]) ?? []);

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  // Group goals by area for the "by area" tab
  const goalsByArea = goals.reduce<Record<string, { area: Area; goals: Goal[] }>>((acc, goal) => {
    const areaName = goal.areas?.name ?? "Ukjent";
    if (!acc[areaName]) {
      acc[areaName] = { area: goal.areas, goals: [] };
    }
    acc[areaName].goals.push(goal);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Mål
          </h1>
          <p className="text-muted-foreground">Dine mål og ambisjoner</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nytt mål
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="quarterly">Kvartal</TabsTrigger>
          <TabsTrigger value="yearly">Årlig</TabsTrigger>
          <TabsTrigger value="area">Etter område</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {goals.length === 0 ? (
            <p className="text-muted-foreground">Ingen mål ennå. Opprett ditt første mål for å komme i gang.</p>
          ) : (
            goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))
          )}
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4 mt-4">
          {goals.filter((g) => g.horizon === "quarterly").length === 0 ? (
            <p className="text-muted-foreground">Ingen kvartalsvise mål.</p>
          ) : (
            goals
              .filter((g) => g.horizon === "quarterly")
              .map((goal) => (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={goal.current_progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {goal.current_progress}% fullført
                    </p>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 mt-4">
          {goals.filter((g) => g.horizon === "yearly").length === 0 ? (
            <p className="text-muted-foreground">Ingen årlige mål.</p>
          ) : (
            goals
              .filter((g) => g.horizon === "yearly")
              .map((goal) => (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={goal.current_progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {goal.current_progress}% fullført
                    </p>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="area" className="space-y-6 mt-4">
          {Object.keys(goalsByArea).length === 0 ? (
            <p className="text-muted-foreground">Ingen mål ennå.</p>
          ) : (
            Object.entries(goalsByArea).map(([areaName, { area, goals: areaGoals }]) => (
              <div key={areaName} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: area?.color ?? "#6b7280" }}
                  />
                  <h3 className="font-semibold text-lg">{areaName}</h3>
                </div>
                {areaGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <CreateGoalDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        areas={areas}
        onCreated={(goal) => {
          setGoals((prev) => [...prev, goal]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateGoalDialog({
  open,
  onOpenChange,
  areas,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: Area[];
  onCreated: (goal: Goal) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [horizon, setHorizon] = useState("quarterly");
  const [areaId, setAreaId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Tittel er påkrevd");
      return;
    }
    if (!areaId) {
      setFormError("Velg et område");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          horizon,
          area_id: areaId,
          target_date: targetDate || null,
          why_it_matters: whyItMatters.trim() || null,
          status: "active",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kunne ikke opprette mål");
      }

      const data = await res.json();
      // Attach area info for UI display
      const area = areas.find((a) => a.id === areaId);
      const goalWithArea = { ...data, areas: area ?? { id: areaId, name: "Ukjent", color: "#6b7280", slug: "" } };
      onCreated(goalWithArea);
      setTitle("");
      setDescription("");
      setHorizon("quarterly");
      setAreaId("");
      setTargetDate("");
      setWhyItMatters("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Noe gikk galt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nytt mål</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Tittel</Label>
            <Input
              id="goal-title"
              placeholder="F.eks. Løpe halvmaraton"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-desc">Beskrivelse (valgfritt)</Label>
            <Textarea
              id="goal-desc"
              placeholder="Beskriv målet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horisont</Label>
              <Select value={horizon} onValueChange={setHorizon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short-term">Kortsiktig</SelectItem>
                  <SelectItem value="monthly">Månedlig</SelectItem>
                  <SelectItem value="quarterly">Kvartalsvis</SelectItem>
                  <SelectItem value="yearly">Årlig</SelectItem>
                  <SelectItem value="long-term">Langsiktig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Område</Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg område..." />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-target-date">Måldato</Label>
            <Input
              id="goal-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-why">Hvorfor er dette viktig?</Label>
            <Textarea
              id="goal-why"
              placeholder="Motivasjonen bak målet..."
              value={whyItMatters}
              onChange={(e) => setWhyItMatters(e.target.value)}
              rows={2}
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Opprett mål
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{goal.title}</CardTitle>
          <Badge variant="outline">
            {horizonLabels[goal.horizon] ?? goal.horizon}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: goal.areas?.color ?? "#6b7280" }}
            />
            <span className="text-sm text-muted-foreground">
              {goal.areas?.name ?? "Ukjent"}
            </span>
            {goal.target_date && (
              <>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Mål: {new Date(goal.target_date).toLocaleDateString("nb-NO")}
                </span>
              </>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Fremgang</span>
              <span>{goal.current_progress}%</span>
            </div>
            <Progress value={goal.current_progress} className="h-2" />
          </div>
          {goal.why_it_matters && (
            <p className="text-sm text-muted-foreground italic">
              Hvorfor: {goal.why_it_matters}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
