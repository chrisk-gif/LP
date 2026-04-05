'use client'

import Link from 'next/link'
import { Globe, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// DEMO DATA - Replace with API call
const DEMO_YTLY = {
  activeInitiatives: [
    { id: '1', title: 'Lansering av AI-konsulent tjeneste', status: 'I gang', progress: 65 },
    { id: '2', title: 'Meta Ads kampanje - april', status: 'Aktiv', progress: 40 },
    { id: '3', title: 'Ny landingsside Excel-automatisering', status: 'Planlagt', progress: 10 },
  ],
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  'I gang': 'default',
  Aktiv: 'secondary',
  Planlagt: 'outline',
}

export function YtlyWidget() {
  return (
    <Link href="/ytly" className="block">
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            ytly.no
          </CardTitle>
          <CardAction>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {DEMO_YTLY.activeInitiatives.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <p className="text-sm truncate min-w-0">{item.title}</p>
              <Badge variant={statusVariant[item.status] ?? 'outline'} className="text-xs shrink-0">
                {item.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </Link>
  )
}
