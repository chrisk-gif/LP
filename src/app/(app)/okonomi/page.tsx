"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, AlertCircle, CheckCircle, Clock, Receipt } from "lucide-react";

// Demo data
const financeItems = [
  { id: "1", title: "Strøm - Tibber", type: "bill", amount: 2340, vendor: "Tibber", due_date: "2026-04-10", status: "due", category: "Bolig" },
  { id: "2", title: "Internett - Telenor", type: "subscription", amount: 549, vendor: "Telenor", due_date: "2026-04-15", status: "upcoming", category: "Abonnement" },
  { id: "3", title: "Forsikring - If", type: "bill", amount: 3200, vendor: "If Forsikring", due_date: "2026-04-01", status: "overdue", category: "Forsikring" },
  { id: "4", title: "Netflix", type: "subscription", amount: 179, vendor: "Netflix", due_date: "2026-04-20", status: "upcoming", category: "Underholdning" },
  { id: "5", title: "Spotify Family", type: "subscription", amount: 189, vendor: "Spotify", due_date: "2026-04-22", status: "upcoming", category: "Underholdning" },
  { id: "6", title: "Husleie", type: "bill", amount: 12500, vendor: "Utleier", due_date: "2026-04-01", status: "paid", category: "Bolig" },
  { id: "7", title: "Bilverksted - service", type: "receipt", amount: 4500, vendor: "Mekonomen", due_date: "2026-03-28", status: "paid", category: "Transport" },
  { id: "8", title: "BSU-sparing", type: "savings", amount: 2083, vendor: "DNB", due_date: "2026-04-25", status: "upcoming", category: "Sparing" },
];

const formatNOK = (amount: number) =>
  new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
  }).format(amount);

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  upcoming: { label: "Kommende", color: "bg-blue-100 text-blue-800", icon: Clock },
  due: { label: "Forfaller", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  overdue: { label: "Forfalt", color: "bg-red-100 text-red-800", icon: AlertCircle },
  paid: { label: "Betalt", color: "bg-green-100 text-green-800", icon: CheckCircle },
  archived: { label: "Arkivert", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
};

export default function FinancePage() {
  const unpaid = financeItems.filter((f) => !["paid", "archived"].includes(f.status));
  const totalDue = unpaid.reduce((sum, f) => sum + f.amount, 0);
  const overdue = financeItems.filter((f) => f.status === "overdue");
  const thisMonth = financeItems.filter((f) => f.status === "paid");
  const totalPaid = thisMonth.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Økonomi
          </h1>
          <p className="text-muted-foreground">Regninger, abonnementer og sparing</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ny post
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatNOK(totalDue)}</div>
            <p className="text-sm text-muted-foreground">Utestående</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">{overdue.length}</div>
            <p className="text-sm text-muted-foreground">Forfalt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{formatNOK(totalPaid)}</div>
            <p className="text-sm text-muted-foreground">Betalt denne mnd</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {financeItems.filter((f) => f.type === "subscription").length}
            </div>
            <p className="text-sm text-muted-foreground">Abonnementer</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="due">
        <TabsList>
          <TabsTrigger value="due">Forfaller snart</TabsTrigger>
          <TabsTrigger value="overdue">Forfalt</TabsTrigger>
          <TabsTrigger value="recurring">Faste utgifter</TabsTrigger>
          <TabsTrigger value="receipts">Kvitteringer</TabsTrigger>
          <TabsTrigger value="all">Alle</TabsTrigger>
        </TabsList>

        <TabsContent value="due" className="space-y-2 mt-4">
          {financeItems
            .filter((f) => ["due", "upcoming"].includes(f.status))
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .map((item) => (
              <FinanceItemCard key={item.id} item={item} />
            ))}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-2 mt-4">
          {overdue.length === 0 ? (
            <p className="text-muted-foreground">Ingen forfalte poster.</p>
          ) : (
            overdue.map((item) => <FinanceItemCard key={item.id} item={item} />)
          )}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-2 mt-4">
          {financeItems
            .filter((f) => f.type === "subscription")
            .map((item) => <FinanceItemCard key={item.id} item={item} />)}
        </TabsContent>

        <TabsContent value="receipts" className="space-y-2 mt-4">
          {financeItems
            .filter((f) => f.type === "receipt")
            .map((item) => <FinanceItemCard key={item.id} item={item} />)}
        </TabsContent>

        <TabsContent value="all" className="space-y-2 mt-4">
          {financeItems.map((item) => (
            <FinanceItemCard key={item.id} item={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FinanceItemCard({
  item,
}: {
  item: (typeof financeItems)[0];
}) {
  const config = statusConfig[item.status];
  return (
    <Card className="cursor-pointer hover:bg-accent/50">
      <CardContent className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              {item.vendor} • {item.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{formatNOK(item.amount)}</span>
          <Badge className={config.color} variant="outline">
            {config.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(item.due_date).toLocaleDateString("nb-NO")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
