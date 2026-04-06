"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Inbox,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface InboxItem {
  id: string;
  content: string;
  item_type: string | null;
  source: string;
  processed: boolean;
  created_at: string;
}

const sourceLabels: Record<string, string> = {
  manual: "Manuell",
  voice: "Stemme",
  ai: "AI",
};

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/inbox");
      if (!res.ok) throw new Error("Kunne ikke hente innboks");
      const data: InboxItem[] = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!newItem.trim() || adding) return;
    setAdding(true);
    setError(null);

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newItem.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kunne ikke legge til element");
      }
      const data: InboxItem = await res.json();
      setItems((prev) => [data, ...prev]);
      setNewItem("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke legge til");
    } finally {
      setAdding(false);
    }
  };

  const handleProcess = async (id: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, processed: true } : i))
    );

    try {
      const res = await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          processed: true,
          processed_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Feil ved behandling");
    } catch {
      // Revert on error
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, processed: false } : i))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const prevItems = items;
    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      const res = await fetch("/api/inbox", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Feil ved sletting");
    } catch {
      // Revert on error
      setItems(prevItems);
    }
  };

  const unprocessed = items.filter((i) => !i.processed);
  const processed = items.filter((i) => i.processed);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Laster innboks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            Innboks
            {unprocessed.length > 0 && (
              <Badge variant="destructive">{unprocessed.length}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Fang tanker, ideer og påminnelser
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Quick capture */}
      <div className="flex gap-2">
        <Input
          placeholder="Skriv noe å huske..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
          disabled={adding}
        />
        <Button onClick={handleAdd} disabled={adding}>
          {adding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Legg til
        </Button>
      </div>

      {/* Unprocessed items */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          Ubehandlet ({unprocessed.length})
        </h2>
        {unprocessed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Ingen ubehandlede elementer. Legg til noe ovenfor.
          </p>
        ) : (
          unprocessed.map((item) => (
            <Card key={item.id} className="group">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p>{item.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("nb-NO")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {sourceLabels[item.source] ?? item.source}
                    </Badge>
                    {item.item_type && (
                      <Badge variant="secondary" className="text-xs">
                        {item.item_type}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleProcess(item.id)}
                    title="Behandle"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    title="Slett"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Processed items */}
      {processed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Behandlet ({processed.length})
          </h2>
          {processed.map((item) => (
            <Card key={item.id} className="opacity-60">
              <CardContent className="py-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="line-through">{item.content}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
