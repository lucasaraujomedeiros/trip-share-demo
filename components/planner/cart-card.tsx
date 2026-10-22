'use client'

import { Clock, Lock, Minus, Plus, X } from 'lucide-react'
import { CategoryIcon } from './category-icon'
import { Select } from '@/components/ui/select'
import { CATEGORY_LABEL, formatDuration, type Constraint, type Stop } from '@/lib/trip'
import { cn } from '@/lib/utils'

type Props = {
  stop: Stop
  highlighted: boolean
  onHover: (id: string | null) => void
  onChange: (stop: Stop) => void
  onRemove: () => void
  /** Rótulos dos dias; quando informado com onAllocate, exibe o seletor de alocação manual. */
  dayLabels?: string[]
  onAllocate?: (day: number) => void
}

const CONSTRAINT_OPTIONS: { type: Constraint['type']; label: string }[] = [
  { type: 'livre', label: 'Livre' },
  { type: 'inicio', label: 'Início fixo' },
  { type: 'janela', label: 'Janela' },
]

export function CartCard({ stop, highlighted, onHover, onChange, onRemove, dayLabels, onAllocate }: Props) {
  const c = stop.constraint

  function setDuration(delta: number) {
    onChange({ ...stop, durationMin: Math.min(600, Math.max(15, stop.durationMin + delta)) })
  }

  function setConstraintType(type: Constraint['type']) {
    if (type === c.type) return
    const next: Constraint =
      type === 'inicio'
        ? { type, start: '14:00' }
        : type === 'janela'
          ? { type, from: '10:00', to: '12:00' }
          : { type: 'livre' }
    onChange({ ...stop, constraint: next })
  }

  return (
    <article
      onMouseEnter={() => onHover(stop.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'rounded-2xl border bg-card p-4 transition-shadow',
        highlighted ? 'shadow-[0_6px_20px_rgba(0,0,0,0.12)]' : 'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <CategoryIcon category={stop.category} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-snug">{stop.name}</h3>
          <p className="text-xs text-muted-foreground">
            {CATEGORY_LABEL[stop.category]} · {stop.area}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${stop.name}`}
          className="-mr-1 -mt-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden="true" />
          Duração estimada
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDuration(-15)}
            disabled={stop.durationMin <= 15}
            aria-label="Diminuir duração em 15 minutos"
            className="flex size-7 items-center justify-center rounded-full border text-foreground transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
          >
            <Minus className="size-3.5" aria-hidden="true" />
          </button>
          <span className="w-20 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {formatDuration(stop.durationMin)}
          </span>
          <button
            type="button"
            onClick={() => setDuration(15)}
            aria-label="Aumentar duração em 15 minutos"
            className="flex size-7 items-center justify-center rounded-full border text-foreground transition-colors hover:border-foreground"
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {dayLabels && onAllocate && (
        <div className="mt-3 border-t pt-3">
          <Select
            aria-label={`Alocar ${stop.name} em um dia`}
            value=""
            onChange={(e) => e.target.value !== '' && onAllocate(Number(e.target.value))}
            className="h-9"
          >
            <option value="">Alocar em um dia…</option>
            {dayLabels.map((label, i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <fieldset className="mt-3 border-t pt-3">
        <legend className="sr-only">Restrição de horário</legend>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="size-4" aria-hidden="true" />
            Horário
          </span>
          <div className="flex rounded-full bg-muted p-0.5">
            {CONSTRAINT_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                aria-pressed={c.type === opt.type}
                onClick={() => setConstraintType(opt.type)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-all',
                  c.type === opt.type ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {c.type === 'inicio' && (
          <label className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-sm">
            <span>Início obrigatório às</span>
            <input
              type="time"
              value={c.start}
              onChange={(e) => e.target.value && onChange({ ...stop, constraint: { ...c, start: e.target.value } })}
              className="rounded-md bg-background px-2 py-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        )}
        {c.type === 'janela' && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm">
            <span>Visitar apenas entre</span>
            <input
              type="time"
              aria-label="Início da janela"
              value={c.from}
              onChange={(e) => e.target.value && onChange({ ...stop, constraint: { ...c, from: e.target.value } })}
              className="rounded-md bg-background px-2 py-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span>e</span>
            <input
              type="time"
              aria-label="Fim da janela"
              value={c.to}
              onChange={(e) => e.target.value && onChange({ ...stop, constraint: { ...c, to: e.target.value } })}
              className="rounded-md bg-background px-2 py-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}
      </fieldset>
    </article>
  )
}
