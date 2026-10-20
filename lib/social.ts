import { optimizeOrder } from './scheduler'
import { CATALOG, copyTrip, type Constraint, type Stop, type Trip } from './trip'

export type Comment = {
  id: string
  author: string
  text: string
  postedLabel: string
}

export type Post = {
  id: string
  author: string
  /** Cor do avatar (hex). */
  avatarColor: string
  postedLabel: string
  text: string
  /** Índices em PHOTOS (placeholders em gradiente). */
  photos: number[]
  /** Cópia da viagem no momento da postagem. */
  trip: Trip
  likes: number
  likedByMe: boolean
  comments: Comment[]
}

export const ME = { name: 'Ana Souza', avatarColor: '#FF385C' }

type Plan = string | [name: string, constraint: Constraint]

/** Monta uma viagem de exemplo com ids determinísticos (evita divergência entre servidor e cliente). */
function mockTrip(id: string, name: string, startDate: string | null, plans: Plan[][]): Trip {
  return {
    id,
    name,
    destination: 'Rio de Janeiro',
    startDate,
    globalUnallocated: [],
    days: plans.map((plan, d) => {
      const stops: Stop[] = plan.map((item, k) => {
        const [stopName, constraint] = typeof item === 'string' ? [item, { type: 'livre' } as Constraint] : item
        const entry = CATALOG.find((c) => c.name === stopName)!
        const { defaultDuration, ...rest } = entry
        return { ...rest, id: `${id}-${d}-${k}`, durationMin: defaultDuration, constraint }
      })
      return { stops, unallocated: [], order: optimizeOrder(stops, '08:00').map((s) => s.id) }
    }),
  }
}

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-marina',
    author: 'Marina Costa',
    avatarColor: '#7C3AED',
    postedLabel: 'há 2 horas',
    text: 'Fim de semana no Rio com as amigas! Dia 1 foi todo de cultura no Centro, o Museu do Amanhã vale muito a pena. Salvem o roteiro e adaptem para vocês.',
    photos: [0, 2, 4],
    trip: mockTrip('trip-marina', 'Fim de semana carioca', '2026-09-12', [
      [
        'Café da manhã na Confeitaria Colombo',
        'Museu do Amanhã',
        'Museu de Arte do Rio (MAR)',
        ['Samba na Pedra do Sal', { type: 'inicio', start: '19:30' }],
      ],
      ['Cristo Redentor', 'Almoço no Aprazível', 'Escadaria Selarón'],
      ['Bondinho do Pão de Açúcar', 'Pôr do sol no Arpoador', 'Jantar no Leblon'],
    ]),
    likes: 128,
    likedByMe: false,
    comments: [
      { id: 'c-marina-1', author: 'Rafael Lima', text: 'Que roteiro bem montado! Vou clonar para a viagem de novembro.', postedLabel: 'há 1 hora' },
      { id: 'c-marina-2', author: 'Camila Torres', text: 'O almoço no Aprazível é perfeito depois do Cristo.', postedLabel: 'há 40 min' },
    ],
  },
  {
    id: 'post-rafael',
    author: 'Rafael Lima',
    avatarColor: '#0369A1',
    postedLabel: 'ontem',
    text: 'Rio clássico em 2 dias, sem correria. Chegamos cedo ao Cristo e deu tempo de tudo.',
    photos: [3, 1],
    trip: mockTrip('trip-rafael', 'Rio clássico em 2 dias', null, [
      ['Cristo Redentor', 'Praia de Ipanema', ['Pôr do sol no Arpoador', { type: 'inicio', start: '17:15' }]],
      ['Jardim Botânico', 'Parque Lage', ['Jantar no Leblon', { type: 'janela', from: '19:30', to: '22:30' }]],
    ]),
    likes: 64,
    likedByMe: false,
    comments: [{ id: 'c-rafael-1', author: 'Marina Costa', text: 'Clássico e infalível.', postedLabel: 'ontem' }],
  },
  {
    id: 'post-camila',
    author: 'Camila Torres',
    avatarColor: '#F2711C',
    postedLabel: 'há 3 dias',
    text: 'Roteiro para quem ama museu e boa comida. Reservem o Aprazível com antecedência!',
    photos: [4, 5, 0, 2],
    trip: mockTrip('trip-camila', 'Cultura e gastronomia', '2026-08-20', [
      ['Café da manhã na Confeitaria Colombo', 'Museu do Amanhã', 'Museu de Arte do Rio (MAR)', 'Almoço no Aprazível'],
      ['Instituto Moreira Salles', 'Jardim Botânico', ['Jantar no Leblon', { type: 'janela', from: '19:30', to: '22:30' }]],
    ]),
    likes: 212,
    likedByMe: false,
    comments: [],
  },
  {
    id: 'post-bruno',
    author: 'Bruno e Lia',
    avatarColor: '#1E3A8A',
    postedLabel: 'há 1 semana',
    text: 'Rio de noite é outra cidade. Lapa, samba e muita música até de madrugada.',
    photos: [5, 3],
    trip: mockTrip('trip-bruno', 'Rio noturno', null, [
      ['Escadaria Selarón', ['Circo Voador', { type: 'inicio', start: '21:00' }]],
      ['Almoço no Aprazível', ['Samba na Pedra do Sal', { type: 'inicio', start: '00:15' }]],
    ]),
    likes: 87,
    likedByMe: false,
    comments: [{ id: 'c-bruno-1', author: 'Ana Souza', text: 'Já está na minha lista!', postedLabel: 'há 6 dias' }],
  },
]

/** Cópia da viagem que fica salva na postagem (independente de edições futuras). */
export function snapshotForPost(trip: Trip): Trip {
  return copyTrip(trip, { name: trip.name, startDate: trip.startDate })
}

/** Viagem criada ao clonar um post: mesma estrutura, sem datas. */
export function cloneFromPost(post: Post): Trip {
  return copyTrip(post.trip, { name: `Cópia de ${post.trip.name}`, startDate: null })
}
