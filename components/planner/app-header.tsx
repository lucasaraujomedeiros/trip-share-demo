import { Columns2, List, Map as MapIcon, Route, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'planejamento' | 'dividido' | 'mapa'
export type Page = 'explorar' | 'viagens' | 'perfil' | 'config'

const PAGES: { id: Page; label: string }[] = [
  { id: 'explorar', label: 'Explorar' },
  { id: 'viagens', label: 'Minhas Viagens' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'config', label: 'Configurações' },
]

const VIEWS: { id: ViewMode; label: string; icon: typeof List }[] = [
  { id: 'planejamento', label: 'Planejamento', icon: List },
  { id: 'dividido', label: 'Dividido', icon: Columns2 },
  { id: 'mapa', label: 'Mapa', icon: MapIcon },
]

type Props = {
  page: Page
  onPageChange: (p: Page) => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
  /** false enquanto a lista de viagens está aberta (nenhum modo em destaque). */
  viewsActive: boolean
  cartCount: number
  onCartClick: () => void
}

export function AppHeader({ page, onPageChange, view, onViewChange, viewsActive, cartCount, onCartClick }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-3 md:grid md:grid-cols-[1fr_auto_1fr] md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Route className="size-5" aria-hidden="true" />
        </div>
        <p className="text-lg font-bold leading-tight tracking-tight text-primary">rota</p>
      </div>

      <nav
        aria-label="Navegação principal"
        className="order-last flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto"
      >
        {PAGES.map(({ id, label }) => {
          const active = page === id
          return (
            <button
              key={id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onPageChange(id)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {label}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center justify-end gap-2 md:gap-3">
        <button
          type="button"
          onClick={onCartClick}
          aria-label={`Carrinho: ${cartCount} ${cartCount === 1 ? 'item não alocado' : 'itens não alocados'}`}
          className="relative flex size-10 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ShoppingCart className="size-5" aria-hidden="true" />
          {cartCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground tabular-nums"
              aria-hidden="true"
            >
              {cartCount}
            </span>
          )}
        </button>

        <div
          role="group"
          aria-label="Modo de visualização"
          className="flex items-center gap-1 rounded-full border bg-background p-1 shadow-sm"
        >
          {VIEWS.map(({ id, label, icon: Icon }) => {
            const active = page === 'viagens' && viewsActive && view === id
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
                <span className="hidden lg:inline">{label}</span>
                <span className="sr-only lg:hidden">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
