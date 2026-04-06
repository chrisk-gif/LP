"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <Button>
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
    </div>
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
