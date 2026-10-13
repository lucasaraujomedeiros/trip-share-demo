import { HOTEL, type Stop, toMinutes } from './trip'

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
