'use client'

import { useState } from 'react'
import { Clock, Compass, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddPopover } from './add-popover'
import { CategoryIcon } from './category-icon'
import { NewTripDialog } from './new-trip-dialog'
import { CATALOG, CATEGORY_LABEL, type Category, type Trip } from '@/lib/trip'

type Entry = (typeof CATALOG)[number]

type Props = {
  trip: Trip | null
  isAdded: (name: string) => boolean
  onCreateTrip: (destination: string, days: number) => void
  onAdd: (entry: Entry, day: number | null, time: string | null) => void
}

const BANNER: Record<Category, string> = {
  atracao: 'from-[#FFB199] to-[#FF0844]',
  museu: 'from-[#A18CD1] to-[#5B3FD0]',
  refeicao: 'from-[#FFD66B] to-[#F2711C]',
}

const BANNER_HEIGHT = ['h-40', 'h-52', 'h-44', 'h-56', 'h-48']

export function ExplorePage({ trip, isAdded, onCreateTrip, onAdd }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {trip ? (
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Explorar {trip.destination}</h1>
              <p className="text-sm text-muted-foreground">
                {trip.days.length} {trip.days.length === 1 ? 'dia' : 'dias'} de viagem · toque em + para adicionar ao
                roteiro
              </p>
            </div>
            <Button variant="outline" className="h-9 rounded-full px-4" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Nova viagem
            </Button>
          </div>

          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {CATALOG.map((entry, i) => (
              <li key={entry.name} className="mb-4 break-inside-avoid">
                <article className="overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]">
                  <div
                    className={`flex items-center justify-center bg-gradient-to-br ${BANNER[entry.category]} ${BANNER_HEIGHT[i % BANNER_HEIGHT.length]}`}
                    aria-hidden="true"
                  >
                    <CategoryIcon category={entry.category} className="size-14 text-white/90 drop-shadow" />
                  </div>
                  <div className="flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground">{CATEGORY_LABEL[entry.category]}</p>
                      <h2 className="font-semibold leading-snug text-pretty">{entry.name}</h2>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                        {entry.hours}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        {entry.area}
                      </p>
                    </div>
                    <AddPopover
                      name={entry.name}
                      dayCount={trip.days.length}
                      added={isAdded(entry.name)}
                      onAdd={(day, time) => onAdd(entry, day, time)}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center md:py-28">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
            <Compass className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Para onde vai a sua próxima viagem?
          </h1>
          <p className="mt-3 text-pretty text-muted-foreground">
            Crie uma viagem, explore atrações, museus e restaurantes e monte um roteiro inteligente dia a dia.
          </p>
          <Button className="mt-8 h-12 rounded-xl px-6 text-base font-semibold" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Criar nova viagem
          </Button>
        </section>
      )}

      <NewTripDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        replacing={Boolean(trip)}
        onCreate={onCreateTrip}
      />
    </div>
  )
}
