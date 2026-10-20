'use client'

import { useMemo } from 'react'
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react'
import { MapBase } from './map-base'
import { CITY_NAME, HOTEL, SHIFTS, SHIFT_ORDER, shiftFor, type ShiftId, type Stop } from '@/lib/trip'
import type { Itinerary } from '@/lib/scheduler'
import { curvedSegment, type Pt } from '@/lib/map-geometry'
import { cn } from '@/lib/utils'

export type MapZoom = 'in' | 'out'

const W = 1000
const H = 700
const EASE = '600ms cubic-bezier(0.22, 1, 0.36, 1)'

type MapPoint = Pt & { id: string; name: string; number?: number; shift?: ShiftId }

type Props = {
  destination?: string
  stops: Stop[]
  itinerary: Itinerary | null
  zoom: MapZoom
  onZoomChange: (z: MapZoom) => void
  hoveredId: string | null
  onHover: (id: string | null) => void
}

function computeView(points: Pt[], zoomedIn: boolean) {
  if (!zoomedIn || points.length === 0) {
    const s = 0.78
    return { s, tx: W / 2 - 520 * s, ty: H / 2 - 360 * s }
  }
  const pad = 80
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const s = Math.min(1.7, Math.max(1, Math.min(W / Math.max(maxX - minX, 320), H / Math.max(maxY - minY, 240))))
  return { s, tx: W / 2 - ((minX + maxX) / 2) * s, ty: H / 2 - ((minY + maxY) / 2) * s }
}

export function MapPanel({ destination = CITY_NAME, stops, itinerary, zoom, onZoomChange, hoveredId, onHover }: Props) {
  const zoomedIn = zoom === 'in'

  const points = useMemo<MapPoint[]>(() => {
    if (itinerary) {
      return itinerary.items.map((item, i) => ({
        id: item.stop.id,
        name: item.stop.name,
        x: item.stop.x,
        y: item.stop.y,
        number: i + 1,
        shift: shiftFor(item.start),
      }))
    }
    return stops.map((s) => ({ id: s.id, name: s.name, x: s.x, y: s.y }))
  }, [itinerary, stops])

  const view = computeView([...points, HOTEL], zoomedIn)
  const project = (p: Pt) => ({ x: p.x * view.s + view.tx, y: p.y * view.s + view.ty })

  const segments = useMemo(() => {
    if (!itinerary || points.length === 0) return []
    const path: (Pt & { shift?: ShiftId })[] = [HOTEL, ...points, HOTEL]
    return path.slice(1).map((to, i) => {
      const from = path[i]
      const shift = (to.shift ?? points[points.length - 1].shift)!
      return { key: `seg-${i}`, color: SHIFTS[shift].color, ...curvedSegment(from, to) }
    })
  }, [itinerary, points])

  const hotel = project(HOTEL)

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F3EFE6]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="visible"
        className="absolute inset-0 size-full"
        role="img"
        aria-label={
          itinerary
            ? `Mapa ilustrativo de ${destination} com ${points.length} paradas numeradas e coloridas por turno`
            : `Mapa ilustrativo de ${destination} com ${points.length} paradas selecionadas`
        }
      >
        <defs>
          <filter id="sombra-pin" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.28" />
          </filter>
        </defs>

        <g style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})`, transition: `transform ${EASE}` }}>
          <MapBase zoomedIn={zoomedIn} />

          {zoomedIn && (
          <g aria-hidden="true">
            {segments.map((seg) => (
              <path
                key={`${seg.key}-casing`}
                d={seg.d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={8}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.8}
              />
            ))}
            {segments.map((seg) => (
              <path
                key={seg.key}
                d={seg.d}
                fill="none"
                stroke={seg.color}
                strokeOpacity={0.6}
                strokeWidth={5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {segments.map((seg) => (
              <path
                key={`${seg.key}-arrow`}
                d="M -6 -5.5 L 7 0 L -6 5.5 Q -3 0 -6 -5.5 Z"
                fill={seg.color}
                stroke="#FFFFFF"
                strokeWidth={1.2}
                transform={`translate(${seg.mid.x} ${seg.mid.y}) rotate(${seg.angle}) scale(${1 / view.s})`}
              />
            ))}
          </g>
          )}
        </g>

        <g style={{ transform: `translate(${hotel.x}px, ${hotel.y}px)`, transition: `transform ${EASE}` }}>
          <title>{HOTEL.name}</title>
          <rect x={-14} y={-14} width={28} height={28} rx={9} fill="#222222" stroke="#FFFFFF" strokeWidth={2.5} filter="url(#sombra-pin)" />
          <path d="M -6 1 L 0 -5 L 6 1 M -4 -1 V 6 H 4 V -1" fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {points.map((p) => {
          const pos = project(p)
          const color = p.shift ? SHIFTS[p.shift].color : '#222222'
          const highlighted = hoveredId === p.id
          const scale = (zoomedIn ? 1 : 0.72) * (highlighted ? 1.25 : 1)
          return (
            <g
              key={p.id}
              onMouseEnter={() => onHover(p.id)}
              onMouseLeave={() => onHover(null)}
              className="cursor-pointer"
              style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: `transform ${EASE}` }}
            >
              <title>{p.number ? `${p.number}. ${p.name}` : p.name}</title>
              <g style={{ transform: `scale(${scale})`, transition: 'transform 250ms ease-out' }}>
                {highlighted && <circle r={24} fill={color} fillOpacity={0.2} />}
                <circle r={15} fill={color} stroke="#FFFFFF" strokeWidth={3} filter="url(#sombra-pin)" />
                {p.number ? (
                  <text
                    y={5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill={p.shift ? SHIFTS[p.shift].onColor : '#FFFFFF'}
                  >
                    {p.number}
                  </text>
                ) : (
                  <circle r={4.5} fill="#FFFFFF" />
                )}
              </g>
            </g>
          )
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
        <div className="pointer-events-auto rounded-2xl bg-background/95 px-3.5 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            {destination}
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {zoomedIn ? 'Visão de ruas · sequência e rotas' : 'Visão da cidade · distribuição das paradas'}
          </p>
        </div>

        <div
          role="group"
          aria-label="Nível de zoom do mapa"
          className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl bg-background shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
        >
          <ZoomButton active={zoomedIn} onClick={() => onZoomChange('in')} icon={ZoomIn} label="Aproximar" hint="Ruas" />
          <div className="mx-2 h-px bg-border" />
          <ZoomButton active={!zoomedIn} onClick={() => onZoomChange('out')} icon={ZoomOut} label="Afastar" hint="Cidade" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-start">
        {itinerary ? (
          <ul className="pointer-events-auto flex flex-wrap gap-x-3 gap-y-1.5 rounded-2xl bg-background/95 px-3.5 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
            {SHIFT_ORDER.map((id) => (
              <li key={id} className="flex items-center gap-1.5 text-xs font-medium">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: SHIFTS[id].color }} aria-hidden="true" />
                {SHIFTS[id].label}
              </li>
            ))}
          </ul>
        ) : (
          <p className="pointer-events-auto rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg">
            Gere o roteiro para ver a rota e os turnos no mapa
          </p>
        )}
      </div>
    </div>
  )
}

function ZoomButton({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean
  onClick: () => void
  icon: typeof ZoomIn
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-foreground text-background' : 'hover:bg-accent',
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="flex flex-col leading-tight">
        <span className="font-semibold">{label}</span>
        <span className={cn('hidden text-[11px] sm:block', active ? 'text-background/70' : 'text-muted-foreground')}>{hint}</span>
      </span>
    </button>
  )
}
