import { HOTEL, type Day, type Stop, toMinutes } from './trip'

export type ScheduledStop = {
  stop: Stop
  start: number
  end: number
  travelMin: number
  waitMin: number
  issue: string | null
}

export type Itinerary = {
  items: ScheduledStop[]
  departure: number
  returnLimit: number
  returnArrival: number
  returnTravel: number
}

type Point = { x: number; y: number }

export function travelMinutes(a: Point, b: Point) {
  const dist = Math.hypot(a.x - b.x, a.y - b.y)
  return Math.round(dist / 18 + 6)
}

function normalize(time: string, departure: number) {
  const t = toMinutes(time)
  return t < departure ? t + 1440 : t
}

function bounds(stop: Stop, departure: number) {
  const c = stop.constraint
  if (c.type === 'inicio') {
    const f = normalize(c.start, departure)
    return { earliest: f, latestStart: f }
  }
  if (c.type === 'janela') {
    const from = normalize(c.from, departure)
    let to = normalize(c.to, departure)
    if (to <= from) to += 1440
    return { earliest: from, latestStart: to - stop.durationMin }
  }
  return { earliest: -Infinity, latestStart: Infinity }
}

function evaluate(stop: Stop, from: Point, now: number, departure: number) {
  const travel = travelMinutes(from, stop)
  const arrival = now + travel
  const b = bounds(stop, departure)
  const start = Math.max(arrival, b.earliest)
  return { travel, arrival, start, feasible: start <= b.latestStart, latestStart: b.latestStart }
}

export function scheduleInOrder(stops: Stop[], departureTime: string, returnTime: string): Itinerary {
  const departure = toMinutes(departureTime)
  let returnLimit = toMinutes(returnTime)
  if (returnLimit <= departure) returnLimit += 1440

  let now = departure
  let pos: Point = HOTEL
  const items: ScheduledStop[] = stops.map((stop) => {
    const e = evaluate(stop, pos, now, departure)
    const end = e.start + stop.durationMin
    let issue: string | null = null
    if (!e.feasible) issue = 'Restrição de horário não atendida'
    else if (end > returnLimit) issue = 'Termina após o horário de retorno'
    const item: ScheduledStop = {
      stop,
      start: e.start,
      end,
      travelMin: e.travel,
      waitMin: e.start - e.arrival,
      issue,
    }
    now = end
    pos = stop
    return item
  })

  const returnTravel = travelMinutes(pos, HOTEL)
  return { items, departure, returnLimit, returnArrival: now + returnTravel, returnTravel }
}

export function optimizeOrder(stops: Stop[], departureTime: string): Stop[] {
  const departure = toMinutes(departureTime)
  const remaining = [...stops]
  const ordered: Stop[] = []
  let now = departure
  let pos: Point = HOTEL

  while (remaining.length) {
    let best: { stop: Stop; score: number } | null = null
    let fallback: { stop: Stop; score: number } | null = null

    for (const candidate of remaining) {
      const e = evaluate(candidate, pos, now, departure)
      const fallbackScore = e.latestStart === Infinity ? e.start + 10000 : e.latestStart
      if (!fallback || fallbackScore < fallback.score) fallback = { stop: candidate, score: fallbackScore }
      if (!e.feasible) continue

      const end = e.start + candidate.durationMin
      const keepsOthersFeasible = remaining.every((other) => {
        if (other === candidate || other.constraint.type === 'livre') return true
        return evaluate(other, candidate, end, departure).feasible
      })
      if (!keepsOthersFeasible) continue

      const score = e.start + e.travel * 0.6
      if (!best || score < best.score) best = { stop: candidate, score }
    }

    const chosen = (best ?? fallback)!.stop
    const e = evaluate(chosen, pos, now, departure)
    now = e.start + chosen.durationMin
    pos = chosen
    ordered.push(chosen)
    remaining.splice(remaining.indexOf(chosen), 1)
  }

  return ordered
}

/**
 * Divide as paradas em `dayCount` grupos geograficamente próximos (k-means simples com
 * capacidade por grupo). Os grupos maiores vão para os dias com menos itens já alocados.
 */
export function distributeAcrossDays(stops: Stop[], dayCount: number, existingCounts: number[] = []): Stop[][] {
  const result: Stop[][] = Array.from({ length: dayCount }, () => [])
  if (stops.length === 0 || dayCount === 0) return result

  const k = Math.min(dayCount, stops.length)
  const capacity = Math.ceil(stops.length / k)

  // Sementes: ponto mais afastado dos já escolhidos.
  const seeds: Point[] = [stops[0]]
  while (seeds.length < k) {
    let far = stops[0]
    let farDist = -1
    for (const s of stops) {
      const d = Math.min(...seeds.map((c) => Math.hypot(s.x - c.x, s.y - c.y)))
      if (d > farDist) {
        far = s
        farDist = d
      }
    }
    seeds.push(far)
  }

  let centers = seeds.map((c) => ({ x: c.x, y: c.y }))
  let groups: Stop[][] = []
  for (let iter = 0; iter < 6; iter++) {
    const pairs = stops.flatMap((stop) =>
      centers.map((c, ci) => ({ stop, ci, dist: Math.hypot(stop.x - c.x, stop.y - c.y) })),
    )
    pairs.sort((a, b) => a.dist - b.dist)
    groups = Array.from({ length: k }, () => [])
    const assigned = new Set<string>()
    for (const { stop, ci } of pairs) {
      if (assigned.has(stop.id) || groups[ci].length >= capacity) continue
      groups[ci].push(stop)
      assigned.add(stop.id)
    }
    centers = groups.map((g, i) =>
      g.length
        ? { x: g.reduce((a, s) => a + s.x, 0) / g.length, y: g.reduce((a, s) => a + s.y, 0) / g.length }
        : centers[i],
    )
  }

  const dayOrder = Array.from({ length: dayCount }, (_, i) => i).sort(
    (a, b) => (existingCounts[a] ?? 0) - (existingCounts[b] ?? 0) || a - b,
  )
  ;[...groups].sort((a, b) => b.length - a.length).forEach((g, i) => (result[dayOrder[i]] = g))
  return result
}

/** Linha do tempo de um dia (null se o dia ainda não tem itens alocados). */
export function dayItinerary(day: Day, departureTime: string, returnTime: string): Itinerary | null {
  if (day.stops.length === 0) return null
  const byId = new Map(day.stops.map((s) => [s.id, s]))
  const ordered = day.order.map((id) => byId.get(id)).filter((s): s is Stop => Boolean(s))
  return scheduleInOrder(ordered, departureTime, returnTime)
}
