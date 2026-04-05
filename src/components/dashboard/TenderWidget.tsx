'use client'

import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// DEMO DATA - Replace with API call
const DEMO_TENDERS = {
  pipeline: [
    { status: 'Under utarbeidelse', count: 3, color: 'bg-amber-500' },
    { status: 'Innsendt', count: 2, color: 'bg-blue-500' },
    { status: 'Til evaluering', count: 1, color: 'bg-purple-500' },
  ],
  upcoming: [
    { id: '1', title: 'E39 Lyngdal-Flekkefjord', deadline: '2026-04-12', value: '4.2M' },
    { id: '2', title: 'Rogaland FK - RA veivedlikehold', deadline: '2026-04-18', value: '1.8M' },
  ],
}

function formatDateNO(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

export function TenderWidget() {
  const totalActive = DEMO_TENDERS.pipeline.reduce((sum, p) => sum + p.count, 0)

  return (
    <Link href="/tilbud" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Aktive tilbud
            <Badge variant="secondary" className="ml-1 text-xs">
              {totalActive}
            </Badge>
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            {DEMO_TENDERS.pipeline.map((stage) => (
              <div key={stage.status} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                <span className="text-xs text-muted-foreground">
                  {stage.count} {stage.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Neste frister</p>
            {DEMO_TENDERS.upcoming.map((tender) => (
              <div key={tender.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm truncate">{tender.title}</p>
                  <p className="text-xs text-muted-foreground">Frist: {formatDateNO(tender.deadline)}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                  {tender.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
