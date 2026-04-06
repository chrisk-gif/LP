import Link from 'next/link'
import { FileText, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const statusColors: Record<string, string> = {
  identified: 'bg-gray-500',
  preparing: 'bg-amber-500',
  submitted: 'bg-blue-500',
}

const statusLabels: Record<string, string> = {
  identified: 'Identifisert',
  preparing: 'Under utarbeidelse',
  submitted: 'Innsendt',
}

function formatDateNO(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })
}

export async function TenderWidget() {
  const supabase = await createServerSupabaseClient()

  // Fetch active tenders (not won, lost, or cancelled)
  const { data: tenders } = await supabase
    .from('tenders')
    .select('id, title, status, due_date, client')
    .in('status', ['identified', 'preparing', 'submitted'])
    .order('due_date', { ascending: true, nullsFirst: false })

  const items = tenders ?? []

  // Build pipeline counts
  const pipeline = ['preparing', 'submitted', 'identified']
    .map((status) => ({
      status,
      label: statusLabels[status] ?? status,
      count: items.filter((t) => t.status === status).length,
      color: statusColors[status] ?? 'bg-gray-400',
    }))
    .filter((p) => p.count > 0)

  // Get upcoming deadlines (tenders with due_date)
  const upcoming = items.filter((t) => t.due_date).slice(0, 3)

  return (
    <Link href="/tilbud" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Aktive tilbud
            {items.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {items.length}
              </Badge>
            )}
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen aktive tilbud</p>
          ) : (
            <>
              {pipeline.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {pipeline.map((stage) => (
                    <div key={stage.status} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                      <span className="text-xs text-muted-foreground">
                        {stage.count} {stage.label.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {upcoming.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Neste frister</p>
                  {upcoming.map((tender) => (
                    <div key={tender.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm truncate">{tender.title}</p>
                        {tender.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Frist: {formatDateNO(tender.due_date)}
                          </p>
                        )}
                      </div>
                      {tender.client && (
                        <span className="shrink-0 text-xs font-medium text-muted-foreground">
                          {tender.client}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
