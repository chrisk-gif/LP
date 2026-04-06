"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FinanceItem {
  id: string;
  title: string;
  description: string | null;
  type: FinanceType;
  status: FinanceStatus;
  amount: number | null;
  currency: string;
  vendor: string | null;
  category: string | null;
  due_date: string | null;
  paid_date: string | null;
  recurrence_pattern: string | null;
  reminder_days_before: number;
  notes: string | null;
  attachment_id: string | null;
  created_at: string;
  updated_at: string;
}

type FinanceType =
  | "bill"
  | "subscription"
  | "receipt"
  | "reimbursement"
  | "savings"
  | "investment"
  | "other";

type FinanceStatus = "upcoming" | "due" | "overdue" | "paid" | "archived";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatNOK = (amount: number) =>
  new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
  }).format(amount);

const statusConfig: Record<
  FinanceStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  upcoming: { label: "Kommende", color: "bg-blue-100 text-blue-800", icon: Clock },
  due: { label: "Forfaller", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  overdue: { label: "Forfalt", color: "bg-red-100 text-red-800", icon: AlertCircle },
  paid: { label: "Betalt", color: "bg-green-100 text-green-800", icon: CheckCircle },
  archived: { label: "Arkivert", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
};

const typeLabels: Record<FinanceType, string> = {
  bill: "Regning",
  subscription: "Abonnement",
  receipt: "Kvittering",
  reimbursement: "Refusjon",
  savings: "Sparing",
  investment: "Investering",
  other: "Annet",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FinancePage() {
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/finance");
      if (!res.ok) throw new Error("Kunne ikke hente data");
      const data: FinanceItem[] = await res.json();
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

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    try {
      const res = await fetch("/api/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "paid", paid_date: todayISO() }),
      });
      if (!res.ok) throw new Error("Kunne ikke oppdatere");
      const updated: FinanceItem = await res.json();
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch {
      // Silently fail – could add toast
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Kunne ikke opprette");
    const created: FinanceItem = await res.json();
    setItems((prev) => [...prev, created]);
    setCreateOpen(false);
  };

  // Derived data
  const unpaid = items.filter((f) => !["paid", "archived"].includes(f.status));
  const totalDue = unpaid.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  const overdueItems = items.filter((f) => f.status === "overdue");
  const paidItems = items.filter((f) => f.status === "paid");
  const totalPaid = paidItems.reduce((sum, f) => sum + (f.amount ?? 0), 0);
  const subscriptionCount = items.filter((f) => f.type === "subscription").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchItems}>
          Prøv igjen
        </Button>
      </div>
    );
  }

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
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny post
            </Button>
          </DialogTrigger>
          <CreateFinanceDialog onSubmit={handleCreate} />
        </Dialog>
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
            <div className="text-2xl font-bold text-red-500">{overdueItems.length}</div>
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
            <div className="text-2xl font-bold">{subscriptionCount}</div>
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
          <FilteredList
            items={items
              .filter((f) => ["due", "upcoming"].includes(f.status))
              .sort(
                (a, b) =>
                  new Date(a.due_date ?? "9999").getTime() -
                  new Date(b.due_date ?? "9999").getTime()
              )}
            emptyMessage="Ingen kommende poster."
            onMarkPaid={handleMarkPaid}
            markingPaid={markingPaid}
          />
        </TabsContent>

        <TabsContent value="overdue" className="space-y-2 mt-4">
          <FilteredList
            items={overdueItems}
            emptyMessage="Ingen forfalte poster."
            onMarkPaid={handleMarkPaid}
            markingPaid={markingPaid}
          />
        </TabsContent>

        <TabsContent value="recurring" className="space-y-2 mt-4">
          <FilteredList
            items={items.filter((f) => f.type === "subscription")}
            emptyMessage="Ingen faste utgifter registrert."
            onMarkPaid={handleMarkPaid}
            markingPaid={markingPaid}
          />
        </TabsContent>

        <TabsContent value="receipts" className="space-y-2 mt-4">
          <FilteredList
            items={items.filter((f) => f.type === "receipt")}
            emptyMessage="Ingen kvitteringer registrert."
            onMarkPaid={handleMarkPaid}
            markingPaid={markingPaid}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-2 mt-4">
          <FilteredList
            items={items}
            emptyMessage="Ingen poster registrert enda."
            onMarkPaid={handleMarkPaid}
            markingPaid={markingPaid}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filtered list component
// ---------------------------------------------------------------------------

function FilteredList({
  items,
  emptyMessage,
  onMarkPaid,
  markingPaid,
}: {
  items: FinanceItem[];
  emptyMessage: string;
  onMarkPaid: (id: string) => void;
  markingPaid: string | null;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground py-4 text-center">{emptyMessage}</p>;
  }

  return (
    <>
      {items.map((item) => (
        <FinanceItemCard
          key={item.id}
          item={item}
          onMarkPaid={onMarkPaid}
          isMarking={markingPaid === item.id}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Finance item card
// ---------------------------------------------------------------------------

function FinanceItemCard({
  item,
  onMarkPaid,
  isMarking,
}: {
  item: FinanceItem;
  onMarkPaid: (id: string) => void;
  isMarking: boolean;
}) {
  const config = statusConfig[item.status];
  const isPaid = item.status === "paid" || item.status === "archived";

  return (
    <Card className="hover:bg-accent/50">
      <CardContent className="py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Receipt className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {item.vendor ? `${item.vendor} • ` : ""}
              {item.category ?? typeLabels[item.type]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isPaid && (
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              disabled={isMarking}
              onClick={() => onMarkPaid(item.id)}
            >
              {isMarking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Merk som betalt
            </Button>
          )}
          <span className="font-semibold">
            {item.amount != null ? formatNOK(item.amount) : "-"}
          </span>
          <Badge className={config.color} variant="outline">
            {config.label}
          </Badge>
          {item.due_date && (
            <span className="text-sm text-muted-foreground">
              {new Date(item.due_date).toLocaleDateString("nb-NO")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create finance dialog
// ---------------------------------------------------------------------------

function CreateFinanceDialog({
  onSubmit,
}: {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<string>("bill");
  const [formAmount, setFormAmount] = useState("");
  const [formVendor, setFormVendor] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDueDate, setFormDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError("Tittel er påkrevd");
      setSubmitting(false);
      return;
    }

    if (!formType) {
      setFormError("Velg en type");
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      title: formTitle.trim(),
      type: formType,
      status: "upcoming",
    };

    if (formAmount) payload.amount = parseFloat(formAmount);
    if (formVendor) payload.vendor = formVendor;
    if (formCategory) payload.category = formCategory;
    if (formDueDate) payload.due_date = formDueDate;

    try {
      await onSubmit(payload);
      // Reset form on success
      setFormTitle("");
      setFormType("bill");
      setFormAmount("");
      setFormVendor("");
      setFormCategory("");
      setFormDueDate("");
    } catch {
      setFormError("Kunne ikke opprette post. Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ny økonomipost</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="finance-title">Tittel</Label>
          <Input
            id="finance-title"
            placeholder="F.eks. Strøm - Tibber"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formType} onValueChange={setFormType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bill">Regning</SelectItem>
                <SelectItem value="subscription">Abonnement</SelectItem>
                <SelectItem value="receipt">Kvittering</SelectItem>
                <SelectItem value="reimbursement">Refusjon</SelectItem>
                <SelectItem value="savings">Sparing</SelectItem>
                <SelectItem value="investment">Investering</SelectItem>
                <SelectItem value="other">Annet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="finance-amount">Beløp (kr)</Label>
            <Input
              id="finance-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="finance-vendor">Leverandør</Label>
            <Input
              id="finance-vendor"
              placeholder="F.eks. Tibber"
              value={formVendor}
              onChange={(e) => setFormVendor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="finance-category">Kategori</Label>
            <Input
              id="finance-category"
              placeholder="F.eks. Bolig"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="finance-due-date">Forfallsdato</Label>
          <Input
            id="finance-due-date"
            type="date"
            value={formDueDate}
            onChange={(e) => setFormDueDate(e.target.value)}
          />
        </div>

        {formError && (
          <p className="text-sm text-destructive">{formError}</p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Opprett
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
