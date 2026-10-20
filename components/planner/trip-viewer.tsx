'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CloneNotice } from './clone-notice'
import { ItineraryPanel } from './itinerary-panel'
import { MapPanel, type MapZoom } from './map-panel'
import { Timeline } from './timeline'
import type { ViewMode } from './app-header'
import { dayItinerary } from '@/lib/scheduler'
import { dayTitle, type Stop, type Trip } from '@/lib/trip'
import type { Post } from '@/lib/social'
import { cn } from '@/lib/utils'

type Props = {
  post: Post
  view: ViewMode
  selectedDay: number
  onSelectDay: (day: number) => void
  zoom: MapZoom
  onZoomChange: (z: MapZoom) => void
  hoveredId: string | null
  onHover: (id: string | null) => void
  departure: string
  returnTime: string
  onBack: () => void
  onClone: (post: Post) => Trip
  onOpenTrip: (id: string) => void
}

const noop = () => {}

/** Visualização somente leitura da viagem de um post (Planejamento, Dividido e Mapa). */
export function TripViewer(props: Props) {
  const { post, view, selectedDay, onSelectDay, hoveredId, onHover } = props
  const trip = post.trip
  const day = trip.days[Math.min(selectedDay, trip.days.length - 1)]
  const dayIndex = Math.min(selectedDay, trip.days.length - 1)
  const [notice, setNotice] = useState<{ id: string; name: string } | null>(null)

  const itinerary = useMemo(
    () => (day ? dayItinerary(day, props.departure, props.returnTime) : null),
    [day, props.departure, props.returnTime],
  )
  const mapStops = useMemo(() => (day ? [...day.stops, ...day.unallocated] : []), [day])

  function clone() {
    const copy = props.onClone(post)
    setNotice({ id: copy.id, name: copy.name })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b bg-background px-4 py-2.5 md:px-6">
        <Button variant="outline" className="h-8 rounded-full px-3" onClick={props.onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Button>
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{trip.name}</span> · por {post.author} · somente leitura
        </p>
        <Button className="h-8 rounded-full px-4" onClick={clone}>
          <Copy className="size-4" aria-hidden="true" />
          Clonar
        </Button>
      </div>

      {notice && (
        <div className="border-b bg-background px-4 py-2 md:px-6">
          <CloneNotice tripName={notice.name} onOpen={() => props.onOpenTrip(notice.id)} onDismiss={() => setNotice(null)} />
        </div>
      )}

      {view === 'planejamento' ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
          <section aria-label={dayTitle(trip, dayIndex)} className="mx-auto max-w-3xl rounded-3xl border bg-background">
            <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <button
                type="button"
                onClick={() => onSelectDay(dayIndex - 1)}
                disabled={dayIndex === 0}
                aria-label="Dia anterior"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-semibold tracking-tight">{dayTitle(trip, dayIndex)}</h2>
                <p className="text-xs text-muted-foreground">
                  {trip.name} · dia {dayIndex + 1} de {trip.days.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectDay(dayIndex + 1)}
                disabled={dayIndex === trip.days.length - 1}
                aria-label="Próximo dia"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </header>

            <div className="p-4">
              {day.unallocated.length > 0 && (
                <UnallocatedNames title="Não alocados deste dia" stops={day.unallocated} />
              )}
              {dayIndex === 0 && trip.globalUnallocated.length > 0 && (
                <UnallocatedNames title="Não alocados da viagem" stops={trip.globalUnallocated} />
              )}
              {itinerary ? (
                <Timeline itinerary={itinerary} onReorder={noop} hoveredId={hoveredId} onHover={onHover} readOnly />
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <p className="font-medium">Este dia não tem roteiro</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <>
          <nav aria-label="Dias da viagem" className="flex items-center gap-1 overflow-x-auto border-b px-4 py-2 md:px-6">
            {trip.days.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === dayIndex ? 'true' : undefined}
                onClick={() => onSelectDay(i)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                  i === dayIndex ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {dayTitle(trip, i)}
              </button>
            ))}
          </nav>
          <main className={cn('flex min-h-0 flex-1', view === 'dividido' ? 'flex-col-reverse md:flex-row' : 'flex-col')}>
            {view === 'dividido' && (
              <section
                aria-label="Painel do roteiro"
                className="flex min-h-0 flex-1 flex-col border-t bg-background md:w-[460px] md:flex-none md:border-t-0 md:border-r lg:w-[520px]"
              >
                <ItineraryPanel
                  dayTitle={dayTitle(trip, dayIndex)}
                  itinerary={itinerary}
                  onReorder={noop}
                  hoveredId={hoveredId}
                  onHover={onHover}
                  onGoPlanning={noop}
                  readOnly
                />
              </section>
            )}
            <section
              aria-label="Mapa"
              className={cn('relative min-h-0', view === 'dividido' ? 'h-[42dvh] md:h-auto md:flex-1' : 'flex-1')}
            >
              <MapPanel
                destination={trip.destination}
                stops={mapStops}
                itinerary={itinerary}
                zoom={props.zoom}
                onZoomChange={props.onZoomChange}
                hoveredId={hoveredId}
                onHover={onHover}
              />
            </section>
          </main>
        </>
      )}
    </div>
  )
}

function UnallocatedNames({ title, stops }: { title: string; stops: Stop[] }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <ul className="flex flex-wrap gap-2">
        {stops.map((s) => (
          <li key={s.id} className="rounded-full bg-muted px-3 py-1 text-sm">
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
