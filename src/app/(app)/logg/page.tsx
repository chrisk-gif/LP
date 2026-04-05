"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Star, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";

// Demo data
const reviews = [
  {
    id: "1",
    period: "weekly",
    period_start: "2026-03-30",
    period_end: "2026-04-05",
    wins: "Levert E6-tilbud på tid. Fullført nettside-redesign for ytly.no. 3 treningsøkter.",
    blockers: "Venter på tilbakemelding fra Rogaland FK. Forsikring ikke betalt.",
    lessons_learned: "Bør starte prismatrise tidligere i tilbudsprosessen.",
    next_focus: "Ferdigstille Byåsentunnelen-tilbud. Betale forfalte regninger. Planlegge uka mer strukturert.",
    ai_generated: false,
  },
  {
    id: "2",
    period: "daily",
    period_start: "2026-04-04",
    period_end: "2026-04-04",
    wins: "God styrketreningsøkt. Fikset bug på ytly.no.",
    blockers: "Møtet med byggherre ble utsatt.",
    lessons_learned: "Sett av buffer for uforutsette endringer.",
    next_focus: "Prismatrise Byåsentunnelen. Handle dagligvarer.",
    ai_generated: false,
  },
];

const periodLabels: Record<string, string> = {
  daily: "Daglig",
  weekly: "Ukentlig",
  monthly: "Månedlig",
  quarterly: "Kvartalsvis",
};

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Logg & Refleksjon
          </h1>
          <p className="text-muted-foreground">Daglige, ukentlige og månedlige gjennomganger</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ny gjennomgang
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="daily">Daglig</TabsTrigger>
          <TabsTrigger value="weekly">Ukentlig</TabsTrigger>
          <TabsTrigger value="monthly">Månedlig</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </TabsContent>

        {["daily", "weekly", "monthly"].map((period) => (
          <TabsContent key={period} value={period} className="space-y-4 mt-4">
            {reviews
              .filter((r) => r.period === period)
              .map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            {reviews.filter((r) => r.period === period).length === 0 && (
              <p className="text-muted-foreground">
                Ingen {periodLabels[period].toLowerCase()} gjennomganger ennå.
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {periodLabels[review.period]} gjennomgang
          </CardTitle>
          <Badge variant="outline">
            {new Date(review.period_start).toLocaleDateString("nb-NO")}
            {review.period_start !== review.period_end &&
              ` – ${new Date(review.period_end).toLocaleDateString("nb-NO")}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {review.wins && (
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Seiere</p>
              <p className="text-sm">{review.wins}</p>
            </div>
          </div>
        )}
        {review.blockers && (
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Utfordringer</p>
              <p className="text-sm">{review.blockers}</p>
            </div>
          </div>
        )}
        {review.lessons_learned && (
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Lærdommer</p>
              <p className="text-sm">{review.lessons_learned}</p>
            </div>
          </div>
        )}
        {review.next_focus && (
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Fokus videre</p>
              <p className="text-sm">{review.next_focus}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
