'use client'

import { useState } from 'react'
import { CalendarDays, CheckCircle2, ListChecks, MapPin, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewTripDialog, type NewTripInput } from './new-trip-dialog'
import { tripItemCount, tripPeriod, type Trip } from '@/lib/trip'
import { cn } from '@/lib/utils'

type Props = {
  trips: Trip[]
  currentId: string | null
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onCreateTrip: (input: NewTripInput) => void
}

/** Primeira tela de "Minhas Viagens": todas as viagens, com a atual em destaque. */
export function TripsList({ trips, currentId, onOpen, onDelete, onCreateTrip }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Minhas Viagens</h1>
            <p className="text-sm text-muted-foreground">
              {trips.length} {trips.length === 1 ? 'viagem' : 'viagens'} · escolha uma para montar o roteiro
            </p>
          </div>
          <Button className="h-9 rounded-full px-4" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Nova viagem
          </Button>
        </div>

        {trips.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-background p-10 text-center">
            <p className="font-medium">Você ainda não tem viagens</p>
            <p className="mt-1 text-sm text-muted-foreground">Crie a primeira para começar a montar seu roteiro.</p>
            <Button className="mt-5 h-10 rounded-xl px-5" onClick={() => setDialogOpen(true)}>
              Criar nova viagem
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const current = trip.id === currentId
              const allocated = trip.days.reduce((sum, d) => sum + d.stops.length, 0)
              return (
                <li key={trip.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onOpen(trip.id)}
                    aria-current={current ? 'true' : undefined}
                    className={cn(
                      'flex h-full w-full flex-col rounded-3xl border bg-background p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2',
                      current && 'border-primary ring-2 ring-primary/30',
                    )}
                  >
                    <span className="flex min-h-6 items-center">
                      {current && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          Viagem atual
                        </span>
                      )}
                    </span>
                    <span className="mt-2 pr-8 text-lg font-semibold leading-snug tracking-tight text-balance">
                      {trip.name}
                    </span>
                    <span className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="size-4 shrink-0" aria-hidden="true" />
                      {trip.destination}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                      {tripPeriod(trip)}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ListChecks className="size-4 shrink-0" aria-hidden="true" />
                      {tripItemCount(trip)} {tripItemCount(trip) === 1 ? 'item' : 'itens'} · {allocated} no roteiro
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Excluir a viagem “${trip.name}”? Essa ação não pode ser desfeita.`)) onDelete(trip.id)
                    }}
                    aria-label={`Excluir viagem ${trip.name}`}
                    className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <NewTripDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={onCreateTrip} />
    </div>
  )
}
