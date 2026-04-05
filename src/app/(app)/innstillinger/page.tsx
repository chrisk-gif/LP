"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Settings, Download, Moon, Sun, Globe, Bell, Bot, Mic } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Innstillinger
        </h1>
        <p className="text-muted-foreground">Tilpass systemet ditt</p>
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
              <p className="text-sm text-muted-foreground">Velg lyst eller mørkt tema</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Sun className="h-4 w-4 mr-1" /> Lyst
              </Button>
              <Button variant="outline" size="sm">
                <Moon className="h-4 w-4 mr-1" /> Mørkt
              </Button>
              <Button variant="default" size="sm">System</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Locale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Språk og region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Språk</Label>
            <Input value="Norsk (Bokmål)" disabled />
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
              <Label>Auto-utfør trygge kommandoer</Label>
              <p className="text-sm text-muted-foreground">
                La AI-en automatisk utføre handlinger med høy sikkerhet
              </p>
            </div>
            <Button variant="outline" size="sm">Av</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Morgenoppsummering</Label>
              <p className="text-sm text-muted-foreground">
                Generer en kort oppsummering hver morgen
              </p>
            </div>
            <Button variant="outline" size="sm">Av</Button>
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
                Få talte bekreftelser fra assistenten
              </p>
            </div>
            <Button variant="outline" size="sm">På</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Stemmegjenkjenning</Label>
              <p className="text-sm text-muted-foreground">
                Bruk nettleserens talegjenkjenning når tilgjengelig
              </p>
            </div>
            <Button variant="default" size="sm">På</Button>
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
                Motta varsler om frister og påminnelser
              </p>
            </div>
            <Button variant="outline" size="sm">Aktiver</Button>
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
            Last ned alle dine data som JSON-fil for backup eller portabilitet.
          </p>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Eksporter JSON
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Eksporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
