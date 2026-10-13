'use client'

import { useId, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { CategoryIcon } from './category-icon'
import { CATALOG, CATEGORY_LABEL, createId, stopFromCatalog, type Stop } from '@/lib/trip'
import { cn } from '@/lib/utils'

type Option =
  | { kind: 'catalog'; entry: (typeof CATALOG)[number] }
  | { kind: 'custom'; name: string }

export function StopSearch({ stops, onAdd }: { stops: Stop[]; onAdd: (stop: Stop) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()

  const options = useMemo<Option[]>(() => {
    const taken = new Set(stops.map((s) => s.name))
    const q = query.trim().toLowerCase()
    const matches: Option[] = CATALOG.filter(
      (c) => !taken.has(c.name) && (!q || `${c.name} ${c.area}`.toLowerCase().includes(q)),
    )
      .slice(0, 6)
      .map((entry) => ({ kind: 'catalog', entry }))
    if (q && !CATALOG.some((c) => c.name.toLowerCase() === q)) matches.push({ kind: 'custom', name: query.trim() })
    return matches
  }, [query, stops])

  function select(option: Option) {
    if (option.kind === 'catalog') {
      onAdd(stopFromCatalog(option.entry))
    } else {
      onAdd({
        id: createId(),
        name: option.name,
        area: 'Parada personalizada',
        category: 'atracao',
        durationMin: 60,
        constraint: { type: 'livre' },
        x: 380 + Math.round(Math.random() * 300),
        y: 180 + Math.round(Math.random() * 320),
      })
    }
    setQuery('')
    setActive(0)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      const option = options[active]
      if (option) select(option)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && options.length > 0

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-full border bg-background px-4 py-3 shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition-shadow focus-within:shadow-[0_6px_20px_rgba(0,0,0,0.14)]">
        <Search className="size-4 shrink-0 text-foreground" aria-hidden="true" />
        <input
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          aria-label="Buscar atrações, museus e restaurantes"
          placeholder="Adicionar atração, museu ou refeição…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border bg-popover p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.16)]"
        >
          {options.map((option, i) => (
            <li
              key={option.kind === 'catalog' ? option.entry.name : 'custom'}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => select(option)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
                i === active && 'bg-accent',
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                {option.kind === 'catalog' ? (
                  <CategoryIcon category={option.entry.category} />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {option.kind === 'catalog' ? option.entry.name : `Adicionar “${option.name}”`}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {option.kind === 'catalog'
                    ? `${CATEGORY_LABEL[option.entry.category]} · ${option.entry.area}`
                    : 'Parada personalizada'}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
