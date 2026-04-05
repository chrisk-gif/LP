"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Plus, Clock, Flame, Calendar } from "lucide-react";

// Demo data
const workouts = [
  { id: "1", title: "Styrketrening - Overkropp", type: "strength", planned: "2026-04-07 07:00", completed: null, duration: 60, intensity: "hard" },
  { id: "2", title: "Løping - Intervaller", type: "running", planned: "2026-04-08 06:30", completed: null, duration: 40, intensity: "hard" },
  { id: "3", title: "Styrketrening - Underkropp", type: "strength", planned: "2026-04-10 07:00", completed: null, duration: 60, intensity: "moderate" },
  { id: "4", title: "Løping - Langtur", type: "running", planned: "2026-04-12 08:00", completed: null, duration: 60, intensity: "moderate" },
];

const recentWorkouts = [
  { id: "5", title: "Styrketrening - Overkropp", type: "strength", completed: "2026-04-03", duration: 55, intensity: "hard", notes: "Bra økt, økte vekt på benkpress" },
  { id: "6", title: "Løping - 5km", type: "running", completed: "2026-04-01", duration: 28, intensity: "moderate", notes: "5km på 27:30, føles bra" },
  { id: "7", title: "Styrketrening - Underkropp", type: "strength", completed: "2026-03-31", duration: 50, intensity: "hard", notes: "Ny PR på knebøy: 100kg" },
  { id: "8", title: "Yoga", type: "flexibility", completed: "2026-03-30", duration: 30, intensity: "easy", notes: "Bra for restitusjon" },
];

const weekStats = {
  sessions: 2,
  totalMinutes: 83,
  planned: 4,
};

const intensityColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  hard: "bg-orange-100 text-orange-800",
  max: "bg-red-100 text-red-800",
};

const intensityLabels: Record<string, string> = {
  easy: "Lett",
  moderate: "Moderat",
  hard: "Hard",
  max: "Maks",
};

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6" />
            Trening
          </h1>
          <p className="text-muted-foreground">Planlegging, logging og fremgang</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Logg økt
        </Button>
      </div>

      {/* Week stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold">{weekStats.sessions}</div>
            <p className="text-sm text-muted-foreground">Økter denne uka</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold">{weekStats.totalMinutes}</div>
            <p className="text-sm text-muted-foreground">Minutter trent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold">{weekStats.planned}</div>
            <p className="text-sm text-muted-foreground">Planlagte økter</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plan">
        <TabsList>
          <TabsTrigger value="plan">Ukeplan</TabsTrigger>
          <TabsTrigger value="log">Treningslogg</TabsTrigger>
          <TabsTrigger value="goals">Treningsmål</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-2 mt-4">
          {workouts.map((w) => (
            <Card key={w.id} className="cursor-pointer hover:bg-accent/50">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{w.title}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(w.planned).toLocaleDateString("nb-NO", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                      {" kl. "}
                      {w.planned.split(" ")[1]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {w.duration} min
                  </div>
                  <Badge className={intensityColors[w.intensity]} variant="outline">
                    {intensityLabels[w.intensity]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="log" className="space-y-2 mt-4">
          {recentWorkouts.map((w) => (
            <Card key={w.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{w.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{w.duration} min</span>
                    <Badge className={intensityColors[w.intensity]} variant="outline">
                      {intensityLabels[w.intensity]}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {new Date(w.completed).toLocaleDateString("nb-NO")} — {w.notes}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Treningsmål</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Løpe 5 km under 25 min</span>
                  <span>27:30 nå</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: "45%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>4 treningsøkter per uke</span>
                  <span>2/4 denne uka</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: "50%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Knebøy 120 kg</span>
                  <span>100 kg nå</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: "83%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
