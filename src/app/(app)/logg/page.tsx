"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Star, AlertTriangle, Lightbulb, ArrowRight, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Review {
  id: string;
  period: string;
  period_start: string;
  period_end: string;
  wins: string | null;
  blockers: string | null;
  lessons_learned: string | null;
  next_focus: string | null;
  freeform_notes: string | null;
  ai_generated: boolean;
  created_at: string;
}

interface NoteItem {
  id: string;
  title: string;
  content: string | null;
  pinned: boolean;
  tags: string[];
  created_at: string;
}

const periodLabels: Record<string, string> = {
  daily: "Daglig",
  weekly: "Ukentlig",
  monthly: "Månedlig",
  quarterly: "Kvartalsvis",
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewNote, setViewNote] = useState<NoteItem | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [reviewsRes, notesRes] = await Promise.all([
        supabase.from("reviews").select("*").order("period_start", { ascending: false }),
        supabase.from("notes").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      if (reviewsRes.error) {
        setError("Kunne ikke hente gjennomganger: " + reviewsRes.error.message);
        setLoading(false);
        return;
      }

      setReviews(reviewsRes.data ?? []);
      setNotes((notesRes.data as NoteItem[]) ?? []);
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
          <TabsTrigger value="notes">Notater</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground">Ingen gjennomganger ennå. Opprett din første for å komme i gang.</p>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </TabsContent>

        {["daily", "weekly", "monthly"].map((period) => (
          <TabsContent key={period} value={period} className="space-y-4 mt-4">
            {reviews.filter((r) => r.period === period).length === 0 ? (
              <p className="text-muted-foreground">
                Ingen {periodLabels[period].toLowerCase()} gjennomganger ennå.
              </p>
            ) : (
              reviews
                .filter((r) => r.period === period)
                .map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
            )}
          </TabsContent>
        ))}
        <TabsContent value="notes" className="space-y-4 mt-4">
          {notes.length === 0 ? (
            <p className="text-muted-foreground">Ingen notater ennå.</p>
          ) : (
            notes.map((note) => (
              <Card
                key={note.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setViewNote(note)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString("nb-NO")}
                    </span>
                  </div>
                </CardHeader>
                {note.content && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Note detail dialog */}
      <NoteDetailDialog note={viewNote} onClose={() => setViewNote(null)} />

      {/* Deep-link: ?noteId=<uuid> opens note detail */}
      <Suspense fallback={null}>
        <NoteDeepLinker notes={notes} onOpenNote={setViewNote} />
      </Suspense>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {periodLabels[review.period] ?? review.period} gjennomgang
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

// ==========================================================================
// Deep-link handler: ?noteId=<uuid> opens note detail
// ==========================================================================

function NoteDeepLinker({
  notes,
  onOpenNote,
}: {
  notes: NoteItem[];
  onOpenNote: (note: NoteItem) => void;
}) {
  const searchParams = useSearchParams();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const noteId = searchParams.get("noteId");
    if (!noteId || handled) return;

    const found = notes.find((n) => n.id === noteId);
    if (found) {
      onOpenNote(found);
      setHandled(true);
    }
  }, [searchParams, notes, onOpenNote, handled]);

  return null;
}

// ==========================================================================
// Note detail dialog
// ==========================================================================

function NoteDetailDialog({
  note,
  onClose,
}: {
  note: NoteItem | null;
  onClose: () => void;
}) {
  if (!note) return null;

  return (
    <Dialog open={!!note} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {note.content && (
            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Opprettet: {new Date(note.created_at).toLocaleDateString("nb-NO")}</span>
            {note.pinned && <Badge variant="outline">Festet</Badge>}
          </div>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
