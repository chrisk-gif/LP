"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus } from "lucide-react";

// Demo data
const goals = [
  {
    id: "1",
    title: "Vinne 3 nye tilbud dette kvartalet",
    area: { name: "Asplan Viak", color: "#2563eb" },
    horizon: "quarterly",
    status: "active",
    progress: 33,
    target_date: "2026-06-30",
    why: "Øke omsetning og sikre prosjektportefølje",
  },
  {
    id: "2",
    title: "Lansere ytly.no rådgivningstjeneste",
    area: { name: "ytly.no", color: "#7c3aed" },
    horizon: "monthly",
    status: "active",
    progress: 60,
    target_date: "2026-04-30",
    why: "Bygge egen inntektskilde",
  },
  {
    id: "3",
    title: "Løpe 5 km under 25 minutter",
    area: { name: "Trening", color: "#dc2626" },
    horizon: "quarterly",
    status: "active",
    progress: 45,
    target_date: "2026-06-01",
    why: "Bedre kondisjon og helse",
  },
  {
    id: "4",
    title: "Spare 50 000 kr til nødsfond",
    area: { name: "Økonomi", color: "#d97706" },
    horizon: "yearly",
    status: "active",
    progress: 70,
    target_date: "2026-12-31",
    why: "Økonomisk trygghet",
  },
  {
    id: "5",
    title: "Lese 12 bøker i år",
    area: { name: "Privat", color: "#059669" },
    horizon: "yearly",
    status: "active",
    progress: 25,
    target_date: "2026-12-31",
    why: "Personlig utvikling",
  },
];

const horizonLabels: Record<string, string> = {
  "short-term": "Kortsiktig",
  monthly: "Månedlig",
  quarterly: "Kvartalsvis",
  yearly: "Årlig",
  "long-term": "Langsiktig",
};

export default function GoalsPage() {
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
          {goals.map((goal) => (
            <Card key={goal.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <Badge variant="outline">
                    {horizonLabels[goal.horizon]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: goal.area.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {goal.area.name}
                    </span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      Mål: {new Date(goal.target_date).toLocaleDateString("nb-NO")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Fremgang</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    Hvorfor: {goal.why}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4 mt-4">
          {goals
            .filter((g) => g.horizon === "quarterly")
            .map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={goal.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {goal.progress}% fullført
                  </p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4 mt-4">
          {goals
            .filter((g) => g.horizon === "yearly")
            .map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={goal.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {goal.progress}% fullført
                  </p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="area" className="space-y-4 mt-4">
          <p className="text-muted-foreground">
            Gruppering etter område kommer snart.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
