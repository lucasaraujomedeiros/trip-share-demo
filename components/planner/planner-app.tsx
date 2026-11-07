'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppHeader, type Page, type ViewMode } from './app-header'
import { ExplorePage } from './explore-page'
import { ItineraryPanel } from './itinerary-panel'
import { MapPanel, type MapZoom } from './map-panel'
import { ProfilePage } from './profile-page'
import { SettingsPage, type ThemeId } from './settings-page'
import { SocialPage } from './social-page'
import { TripViewer } from './trip-viewer'
import { TripsList } from './trips-list'
import { TripsPage, type CartScope } from './trips-page'
import type { NewTripInput } from './new-trip-dialog'
import type { NewPostInput } from './new-post-dialog'
import { ME, MOCK_POSTS, cloneFromPost, snapshotForPost, type Post } from '@/lib/social'
import { cartCount, createTrip, dayTitle, stopFromCatalog, type CATALOG, type Day, type Stop, type Trip } from '@/lib/trip'
import { dayItinerary, distributeAcrossDays, optimizeOrder } from '@/lib/scheduler'
import { cn } from '@/lib/utils'

export function PlannerApp() {
  const [page, setPage] = useState<Page>('explorar')
  const [view, setView] = useState<ViewMode>('planejamento')
  const [trips, setTrips] = useState<Trip[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [tripsScreen, setTripsScreen] = useState<'list' | 'detail'>('list')
  const [selectedDay, setSelectedDay] = useState(0)
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [viewerDay, setViewerDay] = useState(0)
  const [departure, setDeparture] = useState('08:00')
  const [returnTime, setReturnTime] = useState('02:30')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [zoom, setZoom] = useState<MapZoom>('in')
  const [theme, setTheme] = useState<ThemeId>('ocean')

  useEffect(() => {
    const saved = localStorage.getItem('tripshare-theme') as ThemeId | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('tripshare-theme', theme)
  }, [theme])

  const trip = trips.find((t) => t.id === currentId) ?? null
  const day = trip?.days[selectedDay]
  const itinerary = useMemo(() => (day ? dayItinerary(day, departure, returnTime) : null), [day, departure, returnTime])
  const mapStops = useMemo(() => (day ? [...day.stops, ...day.unallocated] : []), [day])

  /** Atualiza apenas a viagem atual. */
  function updateTrip(fn: (t: Trip) => Trip) {
    setTrips((all) => all.map((t) => (t.id === currentId ? fn(t) : t)))
  }

  function updateDay(index: number, fn: (d: Day) => Day) {
    updateTrip((t) => ({ ...t, days: t.days.map((d, i) => (i === index ? fn(d) : d)) }))
  }

  function allocate(d: Day, extra: Stop[] = []): Day {
    const stops = [...d.stops, ...d.unallocated, ...extra]
    return { stops, unallocated: [], order: optimizeOrder(stops, departure).map((s) => s.id) }
  }

  function createNewTrip(input: NewTripInput) {
    const created = createTrip(input)
    setTrips((all) => [...all, created])
    setCurrentId(created.id)
    setSelectedDay(0)
  }

  function selectTrip(id: string) {
    setCurrentId(id)
    setSelectedDay(0)
  }

  function openTrip(id: string) {
    selectTrip(id)
    setPage('viagens')
    setView('planejamento')
    setTripsScreen('detail')
  }

  function deleteTrip(id: string) {
    const remaining = trips.filter((t) => t.id !== id)
    setTrips(remaining)
    if (id === currentId) {
      setCurrentId(remaining[0]?.id ?? null)
      setSelectedDay(0)
    }
  }

  function changePage(next: Page) {
    if (next === 'viagens') setTripsScreen('list')
    if (next === 'social') setViewingId(null)
    setPage(next)
  }

  function updatePost(id: string, fn: (p: Post) => Post) {
    setPosts((all) => all.map((p) => (p.id === id ? fn(p) : p)))
  }

  function toggleLike(id: string) {
    updatePost(id, (p) => ({ ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }))
  }

  function addComment(id: string, text: string) {
    updatePost(id, (p) => ({
      ...p,
      comments: [...p.comments, { id: `c-${id}-${p.comments.length + 1}-${Date.now()}`, author: ME.name, text, postedLabel: 'agora' }],
    }))
  }

  function publishPost({ tripId, text, photos }: NewPostInput) {
    const source = trips.find((t) => t.id === tripId)
    if (!source) return
    const post: Post = {
      id: `post-${Date.now()}`,
      author: ME.name,
      avatarColor: ME.avatarColor,
      postedLabel: 'agora mesmo',
      text,
      photos,
      trip: snapshotForPost(source),
      likes: 0,
      likedByMe: false,
      comments: [],
    }
    setPosts((all) => [post, ...all])
  }

  /** Clona a viagem de um post para Minhas Viagens e a torna a viagem atual. */
  function clonePost(post: Post): Trip {
    const copy = cloneFromPost(post)
    setTrips((all) => [...all, copy])
    setCurrentId(copy.id)
    setSelectedDay(0)
    return copy
  }

  function openPost(id: string) {
    setViewingId(id)
    setViewerDay(0)
    setView('planejamento')
  }

  function isAdded(name: string) {
    if (!trip) return false
    const has = (list: Stop[]) => list.some((s) => s.name === name)
    return has(trip.globalUnallocated) || trip.days.some((d) => has(d.unallocated) || has(d.stops))
  }

  function addFromExplore(entry: (typeof CATALOG)[number], dayIndex: number | null, time: string | null) {
    const stop = stopFromCatalog(entry, time ? { type: 'inicio', start: time } : { type: 'livre' })
    if (dayIndex === null) {
      updateTrip((t) => ({ ...t, globalUnallocated: [...t.globalUnallocated, stop] }))
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
    if (scope === 'global') updateTrip((t) => ({ ...t, globalUnallocated: swap(t.globalUnallocated) }))
    else updateDay(scope, (d) => ({ ...d, unallocated: swap(d.unallocated) }))
  }

  function removeStop(scope: CartScope, id: string) {
    const drop = (list: Stop[]) => list.filter((s) => s.id !== id)
    if (scope === 'global') updateTrip((t) => ({ ...t, globalUnallocated: drop(t.globalUnallocated) }))
    else updateDay(scope, (d) => ({ ...d, unallocated: drop(d.unallocated) }))
  }

  /** Move um item do carrinho global para os não alocados do dia escolhido. */
  function allocateStop(id: string, dayIndex: number) {
    updateTrip((t) => {
      const stop = t.globalUnallocated.find((s) => s.id === id)
      if (!stop) return t
      return {
        ...t,
        globalUnallocated: t.globalUnallocated.filter((s) => s.id !== id),
        days: t.days.map((d, i) => (i === dayIndex ? { ...d, unallocated: [...d.unallocated, stop] } : d)),
      }
    })
  }

  /** Distribui o carrinho global entre os dias e gera o roteiro de cada dia com itens. */
  function distributeTrip() {
    updateTrip((t) => {
      if (t.globalUnallocated.length === 0) return t
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
    // Vendo a viagem de um post: os botões apenas trocam o modo do visualizador.
    if (page === 'social' && viewingPost) {
      setView(next)
      return
    }
    goToTrip(next)
  }

  function goToTrip(next: ViewMode) {
    // Sem viagem atual não há o que planejar: leva para Explorar para criar uma.
    if (!trip) {
      setPage('explorar')
      return
    }
    setPage('viagens')
    setTripsScreen('detail')
    setView(next)
  }

  const viewingPost = viewingId ? (posts.find((p) => p.id === viewingId) ?? null) : null
  const showList = page === 'viagens' && (tripsScreen === 'list' || !trip)
  const showSplit = page === 'viagens' && !showList && view !== 'planejamento' && trip && day

  return (
    <div className="flex h-dvh flex-col bg-background">
      <AppHeader
        page={page}
        onPageChange={changePage}
        view={view}
        onViewChange={showView}
        viewsActive={page === 'social' ? Boolean(viewingPost) : page === 'viagens' && !showList}
        cartCount={cartCount(trip)}
        onCartClick={() => goToTrip('planejamento')}
      />

      {page === 'explorar' && (
        <ExplorePage
          trips={trips}
          trip={trip}
          onSelectTrip={selectTrip}
          isAdded={isAdded}
          onCreateTrip={createNewTrip}
          onAdd={addFromExplore}
        />
      )}

      {showList && (
        <TripsList
          trips={trips}
          currentId={currentId}
          onOpen={openTrip}
          onDelete={deleteTrip}
          onCreateTrip={createNewTrip}
        />
      )}

      {page === 'viagens' && !showList && !showSplit && (
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
          onAllocateStop={allocateStop}
          onGoExplore={() => setPage('explorar')}
          onBack={() => setTripsScreen('list')}
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
                  dayTitle={dayTitle(trip, selectedDay)}
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

      {page === 'social' && !viewingPost && (
        <SocialPage
          posts={posts}
          trips={trips}
          currentId={currentId}
          onToggleLike={toggleLike}
          onAddComment={addComment}
          onClone={clonePost}
          onOpenPost={openPost}
          onOpenTrip={openTrip}
          onPublish={publishPost}
        />
      )}

      {page === 'social' && viewingPost && (
        <TripViewer
          post={viewingPost}
          view={view}
          selectedDay={viewerDay}
          onSelectDay={setViewerDay}
          zoom={zoom}
          onZoomChange={setZoom}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          departure={departure}
          returnTime={returnTime}
          onBack={() => setViewingId(null)}
          onClone={clonePost}
          onOpenTrip={openTrip}
        />
      )}

      {page === 'perfil' && <ProfilePage trips={trips} />}
      {page === 'config' && (
        <SettingsPage
          departure={departure}
          onDepartureChange={setDeparture}
          returnTime={returnTime}
          onReturnTimeChange={setReturnTime}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}
    </div>
  )
}
