'use client'

import { useMemo, useState } from 'react'
import { AppHeader, type Page, type ViewMode } from './app-header'
import { ExplorePage } from './explore-page'
import { ItineraryPanel } from './itinerary-panel'
import { MapPanel, type MapZoom } from './map-panel'
import { ProfilePage } from './profile-page'
import { SettingsPage } from './settings-page'
import { TripsPage, type CartScope } from './trips-page'
import { cartCount, createTrip, stopFromCatalog, type CATALOG, type Day, type Stop, type Trip } from '@/lib/trip'
import { dayItinerary, distributeAcrossDays, optimizeOrder } from '@/lib/scheduler'
import { cn } from '@/lib/utils'

export function PlannerApp() {
  const [page, setPage] = useState<Page>('explorar')
  const [view, setView] = useState<ViewMode>('planejamento')
  const [trip, setTrip] = useState<Trip | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [departure, setDeparture] = useState('08:00')
  const [returnTime, setReturnTime] = useState('02:30')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [zoom, setZoom] = useState<MapZoom>('in')

  const day = trip?.days[selectedDay]
  const itinerary = useMemo(() => (day ? dayItinerary(day, departure, returnTime) : null), [day, departure, returnTime])
  const mapStops = useMemo(() => (day ? [...day.stops, ...day.unallocated] : []), [day])

  function updateDay(index: number, fn: (d: Day) => Day) {
    setTrip((t) => t && { ...t, days: t.days.map((d, i) => (i === index ? fn(d) : d)) })
  }

  function allocate(d: Day, extra: Stop[] = []): Day {
    const stops = [...d.stops, ...d.unallocated, ...extra]
    return { stops, unallocated: [], order: optimizeOrder(stops, departure).map((s) => s.id) }
  }

  function createNewTrip(destination: string, days: number) {
    setTrip(createTrip(destination, days))
    setSelectedDay(0)
  }

  function isAdded(name: string) {
    if (!trip) return false
    const has = (list: Stop[]) => list.some((s) => s.name === name)
    return has(trip.globalUnallocated) || trip.days.some((d) => has(d.unallocated) || has(d.stops))
  }

  function addFromExplore(entry: (typeof CATALOG)[number], dayIndex: number | null, time: string | null) {
    const stop = stopFromCatalog(entry, time ? { type: 'inicio', start: time } : { type: 'livre' })
    if (dayIndex === null) {
      setTrip((t) => t && { ...t, globalUnallocated: [...t.globalUnallocated, stop] })
    } else if (time) {
      // Com dia e horário, o item já entra na linha do tempo do dia.
      updateDay(dayIndex, (d) => ({
        ...d,
        stops: [...d.stops, stop],
        order: optimizeOrder([...d.stops, stop], departure).map((s) => s.id),
      }))
    } else {
      updateDay(dayIndex, (d) => ({ ...d, unallocated: [...d.unallocated, stop] }))
    }
  }

  function updateStop(scope: CartScope, stop: Stop) {
    const swap = (list: Stop[]) => list.map((s) => (s.id === stop.id ? stop : s))
    if (scope === 'global') setTrip((t) => t && { ...t, globalUnallocated: swap(t.globalUnallocated) })
    else updateDay(scope, (d) => ({ ...d, unallocated: swap(d.unallocated) }))
  }

  function removeStop(scope: CartScope, id: string) {
    const drop = (list: Stop[]) => list.filter((s) => s.id !== id)
    if (scope === 'global') setTrip((t) => t && { ...t, globalUnallocated: drop(t.globalUnallocated) })
    else updateDay(scope, (d) => ({ ...d, unallocated: drop(d.unallocated) }))
  }

  /** Distribui o carrinho global entre os dias e gera o roteiro de cada dia com itens. */
  function distributeTrip() {
    setTrip((t) => {
      if (!t || t.globalUnallocated.length === 0) return t
      const groups = distributeAcrossDays(
        t.globalUnallocated,
        t.days.length,
        t.days.map((d) => d.stops.length + d.unallocated.length),
      )
      return {
        ...t,
        globalUnallocated: [],
        days: t.days.map((d, i) => (d.stops.length + d.unallocated.length + groups[i].length ? allocate(d, groups[i]) : d)),
      }
    })
  }

  function showView(next: ViewMode) {
    setPage('viagens')
    setView(next)
  }

  const showSplit = page === 'viagens' && view !== 'planejamento' && trip && day

  return (
    <div className="flex h-dvh flex-col bg-background">
      <AppHeader
        page={page}
        onPageChange={setPage}
        view={view}
        onViewChange={showView}
        cartCount={cartCount(trip)}
        onCartClick={() => showView('planejamento')}
      />

      {page === 'explorar' && (
        <ExplorePage trip={trip} isAdded={isAdded} onCreateTrip={createNewTrip} onAdd={addFromExplore} />
      )}

      {page === 'viagens' && !showSplit && (
        <TripsPage
          trip={trip}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          departure={departure}
          returnTime={returnTime}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onDistribute={distributeTrip}
          onGenerateDay={(i) => updateDay(i, (d) => allocate(d))}
          onReorder={(i, ids) => updateDay(i, (d) => ({ ...d, order: ids }))}
          onUpdateStop={updateStop}
          onRemoveStop={removeStop}
          onGoExplore={() => setPage('explorar')}
        />
      )}

      {showSplit && trip && (
        <>
          <nav aria-label="Dias da viagem" className="flex items-center gap-1 overflow-x-auto border-b px-4 py-2 md:px-6">
            {trip.days.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-current={i === selectedDay ? 'true' : undefined}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                  i === selectedDay ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                Dia {i + 1}
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
                  dayNumber={selectedDay + 1}
                  itinerary={itinerary}
                  onReorder={(ids) => updateDay(selectedDay, (d) => ({ ...d, order: ids }))}
                  hoveredId={hoveredId}
                  onHover={setHoveredId}
                  onGoPlanning={() => setView('planejamento')}
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
                zoom={zoom}
                onZoomChange={setZoom}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            </section>
          </main>
        </>
      )}

      {page === 'perfil' && <ProfilePage trip={trip} />}
      {page === 'config' && (
        <SettingsPage
          departure={departure}
          onDepartureChange={setDeparture}
          returnTime={returnTime}
          onReturnTimeChange={setReturnTime}
        />
      )}
    </div>
  )
}
