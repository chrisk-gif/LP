"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Plus, CheckCircle2, Calendar } from "lucide-react";

// Demo data
const personalTasks = [
  { id: "1", title: "Handle dagligvarer", due: "2026-04-05", priority: "medium", done: false },
  { id: "2", title: "Bestille time hos tannlegen", due: "2026-04-10", priority: "low", done: false },
  { id: "3", title: "Vaske bilen", due: "2026-04-06", priority: "low", done: false },
  { id: "4", title: "Planlegge sommerferie", due: "2026-04-30", priority: "medium", done: false },
  { id: "5", title: "Ringe forsikringsselskapet", due: "2026-04-08", priority: "high", done: false },
];

const personalGoals = [
  { id: "1", title: "Lese 12 bøker i år", progress: 25 },
  { id: "2", title: "Lære spansk - grunnleggende", progress: 10 },
  { id: "3", title: "Meditere daglig i 30 dager", progress: 60 },
];

const upcomingEvents = [
  { id: "1", title: "Middag med venner", date: "2026-04-12", time: "18:00" },
  { id: "2", title: "Tannlegetime", date: "2026-04-15", time: "10:00" },
  { id: "3", title: "Helgetur Hemsedal", date: "2026-04-18", time: null },
];

export default function PrivatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="h-6 w-6" />
            Privat
          </h1>
          <p className="text-muted-foreground">Personlige oppgaver, mål og hendelser</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Legg til
        </Button>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Oppgaver</TabsTrigger>
          <TabsTrigger value="goals">Mål</TabsTrigger>
          <TabsTrigger value="events">Hendelser</TabsTrigger>
          <TabsTrigger value="notes">Notater</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-2 mt-4">
          {personalTasks.map((task) => (
            <Card key={task.id} className="cursor-pointer hover:bg-accent/50">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span>{task.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={task.priority === "high" ? "destructive" : "outline"}>
                    {task.priority === "high" ? "Høy" : task.priority === "medium" ? "Medium" : "Lav"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(task.due).toLocaleDateString("nb-NO")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          {personalGoals.map((goal) => (
            <Card key={goal.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="events" className="space-y-2 mt-4">
          {upcomingEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="py-3 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("nb-NO")}
                    {event.time && ` kl. ${event.time}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <p className="text-muted-foreground">Ingen notater ennå. Opprett et notat for å komme i gang.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
