'use client'

import Link from 'next/link'
import { Inbox, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// DEMO DATA - Replace with API call
const DEMO_INBOX = {
  unprocessed: 7,
  recentItems: [
    { id: '1', title: 'Ny epost fra Multiconsult - samarbeidsavtale', source: 'E-post', time: '08:42' },
    { id: '2', title: 'Slack-melding: Prosjektleder E39 ber om oppdatering', source: 'Slack', time: '08:15' },
    { id: '3', title: 'Notat: Ide til automatisering av tilbudsrapporter', source: 'Notat', time: 'I gar' },
  ],
}

const sourceIcon: Record<string, string> = {
  'E-post': 'text-blue-500',
  Slack: 'text-purple-500',
  Notat: 'text-amber-500',
}

export function InboxWidget() {
  return (
    <Link href="/innboks" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Inbox className="h-4 w-4 text-primary" />
            Innboks
            {DEMO_INBOX.unprocessed > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {DEMO_INBOX.unprocessed}
              </Badge>
            )}
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_INBOX.recentItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <span className={`mt-0.5 text-xs font-medium ${sourceIcon[item.source] ?? ''}`}>
                {item.source}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
