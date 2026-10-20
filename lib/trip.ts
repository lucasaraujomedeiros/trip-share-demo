export type Category = 'atracao' | 'museu' | 'refeicao'

export type Constraint =
  | { type: 'livre' }
  | { type: 'inicio'; start: string }
  | { type: 'janela'; from: string; to: string }

export type Stop = {
  id: string
  name: string
  area: string
  category: Category
  durationMin: number
  constraint: Constraint
  hours?: string
  x: number
  y: number
}

export type Day = {
  /** Carrinho diário: itens atribuídos ao dia, ainda sem horário. */
  unallocated: Stop[]
  /** Itens alocados na linha do tempo do dia. */
  stops: Stop[]
  /** Ordem (ids) dos itens alocados. */
  order: string[]
}

export type Trip = {
  id: string
  /** Nome dado pelo usuário, ex.: "Viagem com os amigos". */
  name: string
  destination: string
  /** Data do primeiro dia (AAAA-MM-DD); null quando a viagem foi criada só com número de dias. */
  startDate: string | null
  /** Carrinho global: itens sem dia preferido. */
  globalUnallocated: Stop[]
  days: Day[]
}

export type ShiftId = 'manha' | 'tarde' | 'noite' | 'madrugada'

export type Shift = {
  id: ShiftId
  label: string
  range: string
  color: string
  /** Cor do texto sobre a cor do turno (pins e números). */
  onColor: string
}

export const SHIFTS: Record<ShiftId, Shift> = {
  manha: { id: 'manha', label: 'Manhã', range: '06:00 – 12:00', color: '#F5B301', onColor: '#3D2C00' },
  tarde: { id: 'tarde', label: 'Tarde', range: '12:00 – 18:00', color: '#F2711C', onColor: '#FFFFFF' },
  noite: { id: 'noite', label: 'Noite', range: '18:00 – 00:00', color: '#38BDF8', onColor: '#06304A' },
  madrugada: { id: 'madrugada', label: 'Madrugada', range: '00:00 – 06:00', color: '#7C3AED', onColor: '#FFFFFF' },
}

export const SHIFT_ORDER: ShiftId[] = ['manha', 'tarde', 'noite', 'madrugada']

export const CATEGORY_LABEL: Record<Category, string> = {
  atracao: 'Atração',
  museu: 'Museu',
  refeicao: 'Refeição',
}

export const HOTEL = { name: 'Hospedagem · Copacabana', x: 655, y: 470 }

export const CITY_NAME = 'Rio de Janeiro'

type CatalogEntry = Omit<Stop, 'id' | 'durationMin' | 'constraint' | 'hours'> & {
  hours: string
  defaultDuration: number
}

export const CATALOG: CatalogEntry[] = [
  { name: 'Café da manhã na Confeitaria Colombo', hours: 'Seg–Sáb · 09h–17h', area: 'Centro', category: 'refeicao', x: 560, y: 150, defaultDuration: 60 },
  { name: 'Museu do Amanhã', hours: 'Ter–Dom · 10h–18h', area: 'Praça Mauá', category: 'museu', x: 610, y: 95, defaultDuration: 120 },
  { name: 'Museu de Arte do Rio (MAR)', hours: 'Ter–Dom · 10h–17h', area: 'Praça Mauá', category: 'museu', x: 575, y: 105, defaultDuration: 90 },
  { name: 'Escadaria Selarón', hours: 'Todos os dias · 24h', area: 'Lapa', category: 'atracao', x: 535, y: 205, defaultDuration: 45 },
  { name: 'Almoço no Aprazível', hours: 'Ter–Dom · 12h–22h', area: 'Santa Teresa', category: 'refeicao', x: 480, y: 215, defaultDuration: 90 },
  { name: 'Cristo Redentor', hours: 'Todos os dias · 08h–19h', area: 'Corcovado', category: 'atracao', x: 410, y: 305, defaultDuration: 120 },
  { name: 'Bondinho do Pão de Açúcar', hours: 'Todos os dias · 08h–20h', area: 'Urca', category: 'atracao', x: 780, y: 330, defaultDuration: 90 },
  { name: 'Jardim Botânico', hours: 'Ter–Dom · 08h–17h', area: 'Jardim Botânico', category: 'atracao', x: 315, y: 425, defaultDuration: 90 },
  { name: 'Parque Lage', hours: 'Todos os dias · 08h–17h', area: 'Jardim Botânico', category: 'atracao', x: 355, y: 395, defaultDuration: 60 },
  { name: 'Instituto Moreira Salles', hours: 'Ter–Dom · 11h–20h', area: 'Gávea', category: 'museu', x: 275, y: 470, defaultDuration: 75 },
  { name: 'Pôr do sol no Arpoador', hours: 'Todos os dias · 24h', area: 'Arpoador', category: 'atracao', x: 580, y: 565, defaultDuration: 60 },
  { name: 'Praia de Ipanema', hours: 'Todos os dias · 24h', area: 'Ipanema', category: 'atracao', x: 480, y: 575, defaultDuration: 120 },
  { name: 'Jantar no Leblon', hours: 'Todos os dias · 19h–00h', area: 'Leblon', category: 'refeicao', x: 360, y: 580, defaultDuration: 90 },
  { name: 'Samba na Pedra do Sal', hours: 'Seg e Sex · 19h–01h', area: 'Saúde', category: 'atracao', x: 590, y: 130, defaultDuration: 90 },
  { name: 'Circo Voador', hours: 'Qui–Sáb · 20h–03h', area: 'Lapa', category: 'atracao', x: 545, y: 235, defaultDuration: 120 },
]

let idCounter = 0
export function createId() {
  idCounter += 1
  return `parada-${Date.now().toString(36)}-${idCounter}`
}

export function stopFromCatalog(entry: CatalogEntry, constraint: Constraint = { type: 'livre' }, durationMin?: number): Stop {
  const { defaultDuration, ...rest } = entry
  return { ...rest, id: createId(), durationMin: durationMin ?? defaultDuration, constraint }
}

function seed(name: string, constraint: Constraint, durationMin?: number, id?: string): Stop {
  const entry = CATALOG.find((c) => c.name === name)!
  const { defaultDuration, ...rest } = entry
  return { ...rest, id: id ?? name, durationMin: durationMin ?? defaultDuration, constraint }
}

export const INITIAL_STOPS: Stop[] = [
  seed('Café da manhã na Confeitaria Colombo', { type: 'livre' }, 60),
  seed('Museu do Amanhã', { type: 'janela', from: '10:00', to: '17:00' }, 105),
  seed('Escadaria Selarón', { type: 'livre' }, 45),
  seed('Almoço no Aprazível', { type: 'janela', from: '12:00', to: '15:30' }, 90),
  seed('Cristo Redentor', { type: 'livre' }, 90),
  seed('Pôr do sol no Arpoador', { type: 'inicio', start: '17:15' }, 60),
  seed('Jantar no Leblon', { type: 'janela', from: '19:30', to: '22:30' }, 90),
  seed('Samba na Pedra do Sal', { type: 'inicio', start: '00:15' }, 90),
]

export function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function formatTime(totalMin: number) {
  const m = ((Math.round(totalMin) % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

export function shiftFor(totalMin: number): ShiftId {
  const m = ((totalMin % 1440) + 1440) % 1440
  if (m >= 360 && m < 720) return 'manha'
  if (m >= 720 && m < 1080) return 'tarde'
  if (m >= 1080) return 'noite'
  return 'madrugada'
}

export function describeConstraint(c: Constraint) {
  if (c.type === 'inicio') return `Início obrigatório às ${c.start}`
  if (c.type === 'janela') return `Visitar entre ${c.from} e ${c.to}`
  return null
}

let tripCounter = 0

export function createTrip(input: { name: string; destination: string; dayCount: number; startDate: string | null }): Trip {
  tripCounter += 1
  return {
    id: `viagem-${Date.now().toString(36)}-${tripCounter}`,
    name: input.name,
    destination: input.destination,
    startDate: input.startDate,
    globalUnallocated: [],
    days: Array.from({ length: input.dayCount }, () => ({ unallocated: [], stops: [], order: [] })),
  }
}

/** Cópia profunda de uma viagem: novo id e novos ids de paradas, sem compartilhar nada com a original. */
export function copyTrip(trip: Trip, options: { name: string; startDate: string | null }): Trip {
  tripCounter += 1
  const copyStop = (s: Stop): Stop => ({ ...s, id: createId(), constraint: { ...s.constraint } })
  return {
    id: `viagem-${Date.now().toString(36)}-${tripCounter}`,
    name: options.name,
    destination: trip.destination,
    startDate: options.startDate,
    globalUnallocated: trip.globalUnallocated.map(copyStop),
    days: trip.days.map((d) => {
      const idMap = new Map<string, string>()
      const stops = d.stops.map((s) => {
        const copy = copyStop(s)
        idMap.set(s.id, copy.id)
        return copy
      })
      return {
        stops,
        unallocated: d.unallocated.map(copyStop),
        order: d.order.map((id) => idMap.get(id)).filter((id): id is string => Boolean(id)),
      }
    }),
  }
}

const DAY_MS = 86_400_000

function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Número de dias entre duas datas, contando os dois extremos (11 a 13 = 3 dias). Retorna 0 se inválido. */
export function inclusiveDays(startIso: string, endIso: string) {
  if (!startIso || !endIso) return 0
  const diff = Math.round((parseDate(endIso) - parseDate(startIso)) / DAY_MS)
  return diff < 0 ? 0 : diff + 1
}

function shortDate(ms: number) {
  const d = new Date(ms)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** "Dia 1 · 11/11" quando a viagem tem datas, ou apenas "Dia 1". */
export function dayTitle(trip: Pick<Trip, 'startDate'>, index: number) {
  if (!trip.startDate) return `Dia ${index + 1}`
  return `Dia ${index + 1} · ${shortDate(parseDate(trip.startDate) + index * DAY_MS)}`
}

/** "11/11/2026 – 13/11/2026" ou "4 dias". */
export function tripPeriod(trip: Trip) {
  const n = trip.days.length
  if (!trip.startDate) return `${n} ${n === 1 ? 'dia' : 'dias'}`
  const start = parseDate(trip.startDate)
  const full = (ms: number) => `${shortDate(ms)}/${new Date(ms).getUTCFullYear()}`
  return n === 1 ? full(start) : `${full(start)} – ${full(start + (n - 1) * DAY_MS)}`
}

export function tripItemCount(trip: Trip) {
  return cartCount(trip) + trip.days.reduce((sum, d) => sum + d.stops.length, 0)
}

export function cartCount(trip: Trip | null) {
  if (!trip) return 0
  return trip.globalUnallocated.length + trip.days.reduce((sum, d) => sum + d.unallocated.length, 0)
}
