"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Inbox, Plus, Trash2, ArrowRight, CheckCircle } from "lucide-react";

// Demo data
const initialItems = [
  { id: "1", content: "Ring elektriker om varmekabel i garasjen", type: null, source: "manual", processed: false, created: "2026-04-04" },
  { id: "2", content: "Sjekke pris på ny mobil", type: null, source: "voice", processed: false, created: "2026-04-03" },
  { id: "3", content: "Idé: Lage AI-basert tilbudsmal for Asplan Viak", type: "idea", source: "manual", processed: false, created: "2026-04-02" },
  { id: "4", content: "Husker at Hafslund-faktura skal betales", type: "bill", source: "voice", processed: false, created: "2026-04-01" },
  { id: "5", content: "Artikkelide: Hvordan AI kan effektivisere tilbudsarbeid i rådgivende ingeniør", type: "idea", source: "manual", processed: false, created: "2026-03-30" },
];

const sourceLabels: Record<string, string> = {
  manual: "Manuell",
  voice: "Stemme",
  ai: "AI",
};

export default function InboxPage() {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (!newItem.trim()) return;
    setItems([
      {
        id: String(Date.now()),
        content: newItem.trim(),
        type: null,
        source: "manual",
        processed: false,
        created: new Date().toISOString().split("T")[0],
      },
      ...items,
    ]);
    setNewItem("");
  };

  const handleProcess = (id: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, processed: true } : i)));
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const unprocessed = items.filter((i) => !i.processed);
  const processed = items.filter((i) => i.processed);

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
          <p className="text-muted-foreground">Fang tanker, ideer og påminnelser</p>
        </div>
      </div>

      {/* Quick capture */}
      <div className="flex gap-2">
        <Input
          placeholder="Skriv noe å huske..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1"
        />
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Legg til
        </Button>
      </div>

      {/* Unprocessed items */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Ubehandlet ({unprocessed.length})</h2>
        {unprocessed.map((item) => (
          <Card key={item.id} className="group">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex-1">
                <p>{item.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created).toLocaleDateString("nb-NO")}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {sourceLabels[item.source]}
                  </Badge>
                  {item.type && (
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
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
        ))}
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
