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
  x: number
  y: number
}

export type ShiftId = 'manha' | 'tarde' | 'noite' | 'madrugada'

export type Shift = {
  id: ShiftId
  label: string
  range: string
  color: string
}

export const SHIFTS: Record<ShiftId, Shift> = {
  manha: { id: 'manha', label: 'Manhã', range: '06:00 – 12:00', color: '#F5B301' },
  tarde: { id: 'tarde', label: 'Tarde', range: '12:00 – 18:00', color: '#F2711C' },
  noite: { id: 'noite', label: 'Noite', range: '18:00 – 00:00', color: '#1E3A8A' },
  madrugada: { id: 'madrugada', label: 'Madrugada', range: '00:00 – 06:00', color: '#7C3AED' },
}

export const SHIFT_ORDER: ShiftId[] = ['manha', 'tarde', 'noite', 'madrugada']

export const CATEGORY_LABEL: Record<Category, string> = {
  atracao: 'Atração',
  museu: 'Museu',
  refeicao: 'Refeição',
}

export const HOTEL = { name: 'Hospedagem · Copacabana', x: 655, y: 470 }

export const CITY_NAME = 'Rio de Janeiro'

type CatalogEntry = Omit<Stop, 'id' | 'durationMin' | 'constraint'> & {
  defaultDuration: number
}

export const CATALOG: CatalogEntry[] = [
  { name: 'Café da manhã na Confeitaria Colombo', area: 'Centro', category: 'refeicao', x: 560, y: 150, defaultDuration: 60 },
  { name: 'Museu do Amanhã', area: 'Praça Mauá', category: 'museu', x: 610, y: 95, defaultDuration: 120 },
  { name: 'Museu de Arte do Rio (MAR)', area: 'Praça Mauá', category: 'museu', x: 575, y: 105, defaultDuration: 90 },
  { name: 'Escadaria Selarón', area: 'Lapa', category: 'atracao', x: 535, y: 205, defaultDuration: 45 },
  { name: 'Almoço no Aprazível', area: 'Santa Teresa', category: 'refeicao', x: 480, y: 215, defaultDuration: 90 },
  { name: 'Cristo Redentor', area: 'Corcovado', category: 'atracao', x: 410, y: 305, defaultDuration: 120 },
  { name: 'Bondinho do Pão de Açúcar', area: 'Urca', category: 'atracao', x: 780, y: 330, defaultDuration: 90 },
  { name: 'Jardim Botânico', area: 'Jardim Botânico', category: 'atracao', x: 315, y: 425, defaultDuration: 90 },
  { name: 'Parque Lage', area: 'Jardim Botânico', category: 'atracao', x: 355, y: 395, defaultDuration: 60 },
  { name: 'Instituto Moreira Salles', area: 'Gávea', category: 'museu', x: 275, y: 470, defaultDuration: 75 },
  { name: 'Pôr do sol no Arpoador', area: 'Arpoador', category: 'atracao', x: 580, y: 565, defaultDuration: 60 },
  { name: 'Praia de Ipanema', area: 'Ipanema', category: 'atracao', x: 480, y: 575, defaultDuration: 120 },
  { name: 'Jantar no Leblon', area: 'Leblon', category: 'refeicao', x: 360, y: 580, defaultDuration: 90 },
  { name: 'Samba na Pedra do Sal', area: 'Saúde', category: 'atracao', x: 590, y: 130, defaultDuration: 90 },
  { name: 'Circo Voador', area: 'Lapa', category: 'atracao', x: 545, y: 235, defaultDuration: 120 },
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
