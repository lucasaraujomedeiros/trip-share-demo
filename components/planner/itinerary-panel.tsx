import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TripSettings } from './trip-settings'
import { StopSearch } from './stop-search'
import { CartCard } from './cart-card'
import { Timeline } from './timeline'
import type { Phase } from './planner-app'
import { formatDuration, type Stop } from '@/lib/trip'
import type { Itinerary } from '@/lib/scheduler'
import { cn } from '@/lib/utils'

type Props = {
  wide: boolean
  phase: Phase
  stops: Stop[]
  onStopsChange: (stops: Stop[]) => void
  departure: string
  onDepartureChange: (v: string) => void
  returnTime: string
  onReturnTimeChange: (v: string) => void
  onGenerate: () => void
  onEditStops: () => void
  itinerary: Itinerary | null
  onReorder: (ids: string[]) => void
  hoveredId: string | null
  onHover: (id: string | null) => void
}

export function ItineraryPanel(props: Props) {
  const { wide, phase, stops, onStopsChange, itinerary } = props
  const totalDuration = stops.reduce((sum, s) => sum + s.durationMin, 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b bg-background px-4 py-4 md:px-6">
        <div className={cn('mx-auto', wide && 'max-w-3xl')}>
          <TripSettings
            departure={props.departure}
            onDepartureChange={props.onDepartureChange}
            returnTime={props.returnTime}
            onReturnTimeChange={props.onReturnTimeChange}
          />
          <Button
            onClick={props.onGenerate}
            disabled={stops.length === 0}
            className="mt-3 h-12 w-full rounded-xl bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-base font-semibold text-white hover:opacity-95"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {phase === 'roteiro' ? 'Reotimizar Roteiro' : 'Gerar Roteiro Inteligente'}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
        <div className={cn('mx-auto', wide && 'max-w-3xl')}>
          {phase === 'planejamento' ? (
            <>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Suas paradas</h2>
                  <p className="text-sm text-muted-foreground">
                    {stops.length} {stops.length === 1 ? 'parada' : 'paradas'} · {formatDuration(totalDuration)} de
                    visitas
                  </p>
                </div>
              </div>
              <StopSearch stops={stops} onAdd={(stop) => onStopsChange([...stops, stop])} />
              {stops.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed p-8 text-center">
                  <p className="font-medium">Seu carrinho de paradas está vazio</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Busque atrações, museus e restaurantes acima para começar a montar o seu dia.
                  </p>
                </div>
              ) : (
                <ul className={cn('mt-4 grid gap-3', wide && 'sm:grid-cols-2')}>
                  {stops.map((stop) => (
                    <li key={stop.id}>
                      <CartCard
                        stop={stop}
                        highlighted={props.hoveredId === stop.id}
                        onHover={props.onHover}
                        onChange={(next) => onStopsChange(stops.map((s) => (s.id === next.id ? next : s)))}
                        onRemove={() => onStopsChange(stops.filter((s) => s.id !== stop.id))}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            itinerary && (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Seu roteiro</h2>
                    <p className="text-sm text-muted-foreground">Arraste os cards para reorganizar a ordem.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={props.onEditStops}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Editar paradas
                  </Button>
                </div>
                <Timeline
                  itinerary={itinerary}
                  onReorder={props.onReorder}
                  hoveredId={props.hoveredId}
                  onHover={props.onHover}
                />
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
