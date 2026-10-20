'use client'

import { useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { tripPeriod, type Trip } from '@/lib/trip'
import { cn } from '@/lib/utils'

type Props = {
  trips: Trip[]
  currentId: string | null
  onSelect: (id: string) => void
  onNew: () => void
}

/** Seletor da viagem atual (barra superior de Explorar). */
export function TripSwitcher({ trips, currentId, onSelect, onNew }: Props) {
  const [open, setOpen] = useState(false)
  const current = trips.find((t) => t.id === currentId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Trocar viagem atual"
        className="flex max-w-full items-center gap-2 rounded-full border bg-background py-1.5 pr-3 pl-4 text-left shadow-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="min-w-0">
          <span className="block text-[11px] leading-tight font-semibold tracking-wide text-muted-foreground uppercase">
            Viagem atual
          </span>
          <span className="block truncate text-sm leading-tight font-semibold">{current?.name}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-1.5">
        <ul role="listbox" aria-label="Suas viagens" className="max-h-72 overflow-y-auto">
          {trips.map((trip) => {
            const active = trip.id === currentId
            return (
              <li key={trip.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(trip.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent',
                    active && 'bg-accent',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{trip.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {trip.destination} · {tripPeriod(trip)}
                    </span>
                  </span>
                  {active && <Check className="size-4 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
        <div className="my-1.5 h-px bg-border" />
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            onNew()
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nova viagem
        </button>
      </PopoverContent>
    </Popover>
  )
}
