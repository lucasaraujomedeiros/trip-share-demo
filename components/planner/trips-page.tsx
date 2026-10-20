'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Shuffle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartCard } from './cart-card'
import { Timeline } from './timeline'
import { dayItinerary } from '@/lib/scheduler'
import { formatDuration, type Stop, type Trip } from '@/lib/trip'
import { cn } from '@/lib/utils'

export type CartScope = 'global' | number

type Props = {
  trip: Trip | null
  selectedDay: number
  onSelectDay: (day: number) => void
  departure: string
  returnTime: string
  hoveredId: string | null
  onHover: (id: string | null) => void
  onDistribute: () => void
  onGenerateDay: (day: number) => void
  onReorder: (day: number, ids: string[]) => void
  onUpdateStop: (scope: CartScope, stop: Stop) => void
  onRemoveStop: (scope: CartScope, id: string) => void
  onGoExplore: () => void
}

export function TripsPage(props: Props) {
  const { trip, selectedDay, onSelectDay, hoveredId, onHover } = props
  const day = trip?.days[selectedDay]
  const itinerary = useMemo(
    () => (day ? dayItinerary(day, props.departure, props.returnTime) : null),
    [day, props.departure, props.returnTime],
  )

  if (!trip || !day) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold">Você ainda não tem uma viagem</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie uma viagem na aba Explorar para começar a montar seu roteiro.
          </p>
          <Button className="mt-5 h-10 rounded-xl px-5" onClick={props.onGoExplore}>
            Ir para Explorar
          </Button>
        </div>
      </div>
    )
  }

  const globalTotal = trip.globalUnallocated.reduce((sum, s) => sum + s.durationMin, 0)
  const dayCount = trip.days.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-muted/40 p-4 md:p-6 lg:flex-row lg:overflow-hidden">
      <aside
        aria-label="Não alocados da viagem"
        className="flex shrink-0 flex-col rounded-3xl border bg-background lg:min-h-0 lg:w-[380px]"
      >
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold tracking-tight">Não Alocados da Viagem</h2>
          <p className="text-sm text-muted-foreground">
            {trip.globalUnallocated.length} {trip.globalUnallocated.length === 1 ? 'item' : 'itens'}
            {globalTotal > 0 && ` · ${formatDuration(globalTotal)}`} sem dia preferido
          </p>
          <Button
            onClick={props.onDistribute}
            disabled={trip.globalUnallocated.length === 0}
            className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-[#E61E4D] to-[#D70466] font-semibold text-white hover:opacity-95"
          >
            <Shuffle className="size-4" aria-hidden="true" />
            Distribuir Toda a Viagem
          </Button>
        </div>
        <div className="p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <CartList
            stops={trip.globalUnallocated}
            scope="global"
            empty="Nenhum item sem dia. Itens adicionados em Explorar com “Qualquer dia” aparecem aqui."
            hoveredId={hoveredId}
            onHover={onHover}
            onUpdateStop={props.onUpdateStop}
            onRemoveStop={props.onRemoveStop}
          />
        </div>
      </aside>

      <section
        aria-label={`Dia ${selectedDay + 1}`}
        className="flex shrink-0 flex-col rounded-3xl border bg-background lg:min-h-0 lg:flex-1"
      >
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <button
            type="button"
            onClick={() => onSelectDay(selectedDay - 1)}
            disabled={selectedDay === 0}
            aria-label="Dia anterior"
            className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold tracking-tight">Dia {selectedDay + 1}</h2>
            <p className="text-xs text-muted-foreground">
              {trip.destination} · dia {selectedDay + 1} de {dayCount}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectDay(selectedDay + 1)}
            disabled={selectedDay === dayCount - 1}
            aria-label="Próximo dia"
            className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Não Alocados deste Dia</h3>
                <p className="text-xs text-muted-foreground">
                  {day.unallocated.length} {day.unallocated.length === 1 ? 'item' : 'itens'} sem horário
                </p>
              </div>
              <Button
                onClick={() => props.onGenerateDay(selectedDay)}
                disabled={day.unallocated.length + day.stops.length === 0}
                className="h-10 rounded-xl bg-gradient-to-r from-[#E61E4D] to-[#D70466] px-4 font-semibold text-white hover:opacity-95"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Gerar Roteiro do Dia
              </Button>
            </div>

            <CartList
              stops={day.unallocated}
              scope={selectedDay}
              empty="Nenhum item pendente neste dia."
              hoveredId={hoveredId}
              onHover={onHover}
              onUpdateStop={props.onUpdateStop}
              onRemoveStop={props.onRemoveStop}
              columns
            />

            <h3 className="mt-6 mb-3 font-semibold">Roteiro do dia</h3>
            {itinerary ? (
              <Timeline
                itinerary={itinerary}
                onReorder={(ids) => props.onReorder(selectedDay, ids)}
                hoveredId={hoveredId}
                onHover={onHover}
              />
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <p className="font-medium">Este dia ainda não tem roteiro</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Atribua itens a este dia ou distribua a viagem e depois gere o roteiro.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function CartList({
  stops,
  scope,
  empty,
  hoveredId,
  onHover,
  onUpdateStop,
  onRemoveStop,
  columns,
}: {
  stops: Stop[]
  scope: CartScope
  empty: string
  hoveredId: string | null
  onHover: (id: string | null) => void
  onUpdateStop: (scope: CartScope, stop: Stop) => void
  onRemoveStop: (scope: CartScope, id: string) => void
  columns?: boolean
}) {
  if (stops.length === 0) {
    return <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">{empty}</p>
  }
  return (
    <ul className={cn('grid gap-3', columns && 'xl:grid-cols-2')}>
      {stops.map((stop) => (
        <li key={stop.id}>
          <CartCard
            stop={stop}
            highlighted={hoveredId === stop.id}
            onHover={onHover}
            onChange={(next) => onUpdateStop(scope, next)}
            onRemove={() => onRemoveStop(scope, stop.id)}
          />
        </li>
      ))}
    </ul>
  )
}
