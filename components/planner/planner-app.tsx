'use client'

import { useMemo, useState } from 'react'
import { AppHeader, type ViewMode } from './app-header'
import { ItineraryPanel } from './itinerary-panel'
import { MapPanel, type MapZoom } from './map-panel'
import { INITIAL_STOPS, type Stop } from '@/lib/trip'
import { optimizeOrder, scheduleInOrder } from '@/lib/scheduler'
import { cn } from '@/lib/utils'

export type Phase = 'planejamento' | 'roteiro'

export function PlannerApp() {
  const [view, setView] = useState<ViewMode>('dividido')
  const [stops, setStops] = useState<Stop[]>(INITIAL_STOPS)
  const [departure, setDeparture] = useState('08:00')
  const [returnTime, setReturnTime] = useState('02:30')
  const [phase, setPhase] = useState<Phase>('planejamento')
  const [order, setOrder] = useState<string[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [zoom, setZoom] = useState<MapZoom>('in')

  const itinerary = useMemo(() => {
    if (phase !== 'roteiro') return null
    const byId = new Map(stops.map((s) => [s.id, s]))
    const ordered = order.map((id) => byId.get(id)).filter((s): s is Stop => Boolean(s))
    return scheduleInOrder(ordered, departure, returnTime)
  }, [phase, stops, order, departure, returnTime])

  function generate() {
    if (stops.length === 0) return
    setOrder(optimizeOrder(stops, departure).map((s) => s.id))
    setPhase('roteiro')
  }

  const showPanel = view !== 'mapa'
  const showMap = view !== 'roteiro'

  return (
    <div className="flex h-dvh flex-col bg-background">
      <AppHeader view={view} onViewChange={setView} />
      <main
        className={cn(
          'flex min-h-0 flex-1',
          view === 'dividido' ? 'flex-col-reverse md:flex-row' : 'flex-col',
        )}
      >
        {showPanel && (
          <section
            aria-label="Painel do roteiro"
            className={cn(
              'flex min-h-0 flex-col bg-background',
              view === 'dividido'
                ? 'flex-1 border-t md:w-[460px] md:flex-none md:border-t-0 md:border-r lg:w-[520px]'
                : 'flex-1',
            )}
          >
            <ItineraryPanel
              wide={view === 'roteiro'}
              phase={phase}
              stops={stops}
              onStopsChange={setStops}
              departure={departure}
              onDepartureChange={setDeparture}
              returnTime={returnTime}
              onReturnTimeChange={setReturnTime}
              onGenerate={generate}
              onEditStops={() => setPhase('planejamento')}
              itinerary={itinerary}
              onReorder={setOrder}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          </section>
        )}
        {showMap && (
          <section
            aria-label="Mapa"
            className={cn('relative min-h-0', view === 'dividido' ? 'h-[42dvh] md:h-auto md:flex-1' : 'flex-1')}
          >
            <MapPanel
              stops={stops}
              itinerary={itinerary}
              zoom={zoom}
              onZoomChange={setZoom}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          </section>
        )}
      </main>
    </div>
  )
}
