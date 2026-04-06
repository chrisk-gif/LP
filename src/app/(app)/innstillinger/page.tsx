"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Moon, Sun, Globe, Bell, Bot, Mic, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserPreferences {
  theme: string | null;
  ai_auto_execute: boolean;
  voice_tts_enabled: boolean;
  working_hours: Record<string, unknown> | null;
  planning_style: string | null;
  review_cadence: Record<string, unknown> | null;
  dashboard_widgets: Record<string, unknown> | null;
}

type ThemeValue = "light" | "dark" | "system";

function applyTheme(theme: ThemeValue) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    // system
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeValue>("system");
  const [aiAutoExecute, setAiAutoExecute] = useState(false);
  const [voiceTtsEnabled, setVoiceTtsEnabled] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadPreferences() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data } = await supabase
          .from("user_preferences")
          .select("*")
          .single();

        if (data) {
          const prefs = data as UserPreferences;
          const loadedTheme = (prefs.theme as ThemeValue) || "system";
          setTheme(loadedTheme);
          setAiAutoExecute(prefs.ai_auto_execute ?? false);
          setVoiceTtsEnabled(prefs.voice_tts_enabled ?? true);
          applyTheme(loadedTheme);
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const savePreference = useCallback(async (updates: Partial<Record<string, unknown>>) => {
    if (!userId) return;
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", userId);

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save preference:", err);
    } finally {
      setSaving(false);
    }
  }, [userId, supabase]);

  function handleThemeChange(newTheme: ThemeValue) {
    setTheme(newTheme);
    applyTheme(newTheme);
    savePreference({ theme: newTheme });
  }

  function handleAiAutoExecuteToggle() {
    const newValue = !aiAutoExecute;
    setAiAutoExecute(newValue);
    savePreference({ ai_auto_execute: newValue });
  }

  function handleVoiceTtsToggle() {
    const newValue = !voiceTtsEnabled;
    setVoiceTtsEnabled(newValue);
    savePreference({ voice_tts_enabled: newValue });
  }

  function handleExportJson() {
    window.location.href = "/api/export";
  }

  async function handleExportCsv() {
    setExportingCsv(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Export failed");
      const exportData = await res.json();

      const csvParts: string[] = [];
      const tables = exportData.data as Record<string, Array<Record<string, unknown>> | null>;

      for (const [tableName, rows] of Object.entries(tables)) {
        if (!rows || rows.length === 0) continue;

        csvParts.push(`# ${tableName}`);
        const headers = Object.keys(rows[0]);
        csvParts.push(headers.join(","));

        for (const row of rows) {
          const values = headers.map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return "";
            const str = typeof val === "object" ? JSON.stringify(val) : String(val);
            // Escape CSV values containing commas, quotes, or newlines
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          });
          csvParts.push(values.join(","));
        }
        csvParts.push(""); // blank line between tables
      }

      const csvContent = csvParts.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `livsplanlegg-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV export failed:", err);
    } finally {
      setExportingCsv(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Laster innstillinger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Innstillinger
          </h1>
          <p className="text-muted-foreground">Tilpass systemet ditt</p>
        </div>
        {(saving || saved) && (
          <div className="flex items-center gap-1.5 text-sm">
            {saving && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Lagrer...</span>
              </>
            )}
            {saved && !saving && (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Lagret</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Utseende
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Tema</Label>
              <p className="text-sm text-muted-foreground">Velg lyst eller morkt tema</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="h-4 w-4 mr-1" /> Lyst
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="h-4 w-4 mr-1" /> Morkt
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("system")}
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Locale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sprak og region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Sprak</Label>
            <Input value="Norsk (Bokmal)" disabled />
          </div>
          <div className="grid gap-2">
            <Label>Tidssone</Label>
            <Input value="Europe/Oslo" disabled />
          </div>
          <div className="grid gap-2">
            <Label>Valuta</Label>
            <Input value="NOK" disabled />
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-innstillinger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-utfor trygge kommandoer</Label>
              <p className="text-sm text-muted-foreground">
                La AI-en automatisk utfore handlinger med hoy sikkerhet
              </p>
            </div>
            <Button
              variant={aiAutoExecute ? "default" : "outline"}
              size="sm"
              onClick={handleAiAutoExecuteToggle}
            >
              {aiAutoExecute ? "Pa" : "Av"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Morgenoppsummering</Label>
              <p className="text-sm text-muted-foreground">
                Generer en kort oppsummering hver morgen
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Kommer snart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Stemme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Talte svar</Label>
              <p className="text-sm text-muted-foreground">
                Fa talte bekreftelser fra assistenten
              </p>
            </div>
            <Button
              variant={voiceTtsEnabled ? "default" : "outline"}
              size="sm"
              onClick={handleVoiceTtsToggle}
            >
              {voiceTtsEnabled ? "Pa" : "Av"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Stemmegjenkjenning</Label>
              <p className="text-sm text-muted-foreground">
                Bruk nettleserens talegjenkjenning nar tilgjengelig
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Kommer snart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Varsler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Nettleservarsler</Label>
              <p className="text-sm text-muted-foreground">
                Motta varsler om frister og paminnelser
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Kommer snart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Eksport
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Last ned alle dine data som JSON- eller CSV-fil for backup eller portabilitet.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportJson}>
              <Download className="mr-2 h-4 w-4" />
              Eksporter JSON
            </Button>
            <Button variant="outline" onClick={handleExportCsv} disabled={exportingCsv}>
              {exportingCsv ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Eksporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
