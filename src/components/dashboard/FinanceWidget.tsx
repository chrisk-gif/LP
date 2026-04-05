'use client'

import Link from 'next/link'
import { Wallet, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'

// DEMO DATA - Replace with API call
const DEMO_BILLS = [
  { id: '1', title: 'Husleie', amount: 14500, dueDate: '2026-04-15', paid: false },
  { id: '2', title: 'Strom - Tibber', amount: 1890, dueDate: '2026-04-10', paid: false },
  { id: '3', title: 'Forsikring - Gjensidige', amount: 3200, dueDate: '2026-04-20', paid: false },
  { id: '4', title: 'Barnehage', amount: 3230, dueDate: '2026-04-15', paid: false },
]

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

export function FinanceWidget() {
  const totalDue = DEMO_BILLS.reduce((sum, b) => sum + b.amount, 0)

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
          <div className="text-xs text-muted-foreground">
            Forfaller denne mnd:{' '}
            <span className="font-semibold text-foreground">{formatNOK(totalDue)}</span>
          </div>
          {DEMO_BILLS.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm truncate">{bill.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateNO(bill.dueDate)}</p>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums">
                {formatNOK(bill.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
