import { Check } from 'lucide-react'
import { TripSettings } from './trip-settings'
import { cn } from '@/lib/utils'

export type ThemeId = 'coral' | 'ocean' | 'forest' | 'golden' | 'midnight'

export const THEMES: {
  id: ThemeId
  name: string
  description: string
  swatches: [string, string, string, string]
}[] = [
  {
    id: 'ocean',
    name: 'Copacabana Ocean',
    description: 'Azul oceano e brisa costeira (Oficial)',
    swatches: ['#0077B6', '#0096C7', '#EBF5F8', '#0A2540'],
  },
  {
    id: 'coral',
    name: 'Coral Sunset',
    description: 'Vibrante e acolhedor',
    swatches: ['#FF385C', '#E61E4D', '#F7F7F7', '#222222'],
  },
  {
    id: 'forest',
    name: 'Tijuca Forest',
    description: 'Verde esmeralda e tons de areia',
    swatches: ['#1B6B4A', '#2D8A61', '#F0ECE1', '#1C2826'],
  },
  {
    id: 'golden',
    name: 'Ipanema Golden Hour',
    description: 'Terracota e âmbar de fim de tarde',
    swatches: ['#D95D39', '#F2711C', '#F7F1E8', '#2C1E18'],
  },
  {
    id: 'midnight',
    name: 'Lapa Midnight',
    description: 'Modo escuro com detalhes neon',
    swatches: ['#FF4D6D', '#7C3AED', '#1E293B', '#0F172A'],
  },
]

type Props = {
  departure: string
  onDepartureChange: (v: string) => void
  returnTime: string
  onReturnTimeChange: (v: string) => void
  theme: ThemeId
  onThemeChange: (theme: ThemeId) => void
}

export function SettingsPage(props: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Preferências usadas para montar os roteiros de todos os dias.</p>

        <section className="mt-6" aria-labelledby="tema">
          <h2 id="tema" className="mb-1 font-semibold">
            Paleta de cores
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Escolha o tema visual do aplicativo para testar diferentes combinações de cores.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {THEMES.map((item) => {
              const active = props.theme === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => props.onThemeChange(item.id)}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-2xl border bg-card p-3.5 text-left transition-all hover:border-foreground/40',
                    active && 'border-primary ring-2 ring-primary/25',
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{item.name}</span>
                      {active && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                    {item.swatches.map((color, i) => (
                      <span
                        key={i}
                        className="size-6 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="horarios">
          <h2 id="horarios" className="mb-1 font-semibold">
            Horários padrão
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Defina quando você sai da hospedagem e até que horas precisa estar de volta.
          </p>
          <TripSettings
            departure={props.departure}
            onDepartureChange={props.onDepartureChange}
            returnTime={props.returnTime}
            onReturnTimeChange={props.onReturnTimeChange}
          />
        </section>

        <section className="mt-8" aria-labelledby="idioma">
          <h2 id="idioma" className="mb-3 font-semibold">
            Idioma e região
          </h2>
          <div className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
            <span>Idioma</span>
            <span className="text-muted-foreground">Português (Brasil)</span>
          </div>
        </section>
      </div>
    </div>
  )
}
