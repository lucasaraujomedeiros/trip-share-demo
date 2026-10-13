import { Columns2, List, Map as MapIcon, Route } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CITY_NAME } from '@/lib/trip'

export type ViewMode = 'dividido' | 'roteiro' | 'mapa'

const VIEWS: { id: ViewMode; label: string; icon: typeof List }[] = [
  { id: 'dividido', label: 'Dividido', icon: Columns2 },
  { id: 'roteiro', label: 'Roteiro', icon: List },
  { id: 'mapa', label: 'Mapa', icon: MapIcon },
]

export function AppHeader({ view, onViewChange }: { view: ViewMode; onViewChange: (v: ViewMode) => void }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Route className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight tracking-tight text-primary">rota</p>
          <h1 className="truncate text-xs text-muted-foreground">Um dia em {CITY_NAME}</h1>
        </div>
      </div>

      <div
        role="group"
        aria-label="Modo de visualização"
        className="flex items-center gap-1 rounded-full border bg-background p-1 shadow-sm"
      >
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => onViewChange(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sr-only sm:hidden">{label}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}
