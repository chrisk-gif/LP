import Link from 'next/link'
import { Wallet, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function formatNOK(amount: number): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateNO(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

export async function FinanceWidget() {
  const supabase = await createServerSupabaseClient()

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

  const { data: bills } = await supabase
    .from('finance_items')
    .select('id, title, amount, due_date, status')
    .gte('due_date', monthStart)
    .lt('due_date', monthEnd)
    .not('status', 'eq', 'paid')
    .order('due_date', { ascending: true })
    .limit(5)

  const items = bills ?? []
  const totalDue = items.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)

  return (
    <Link href="/okonomi" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Okonomi
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen ubetalte regninger denne mnd</p>
          ) : (
            <>
              <div className="text-xs text-muted-foreground">
                Forfaller denne mnd:{' '}
                <span className="font-semibold text-foreground">{formatNOK(totalDue)}</span>
              </div>
              {items.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{bill.title}</p>
                    {bill.due_date && (
                      <p className="text-xs text-muted-foreground">{formatDateNO(bill.due_date)}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatNOK(Number(bill.amount) || 0)}
                  </span>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
