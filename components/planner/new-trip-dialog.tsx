'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CITY_NAME, inclusiveDays } from '@/lib/trip'
import { cn } from '@/lib/utils'

export const MAX_DAYS = 14

export type NewTripInput = {
  name: string
  destination: string
  dayCount: number
  startDate: string | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: NewTripInput) => void
}

type Mode = 'dias' | 'datas'

const FIELD =
  'mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'

export function NewTripDialog({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = useState('')
  const [destination, setDestination] = useState(CITY_NAME)
  const [mode, setMode] = useState<Mode>('dias')
  const [days, setDays] = useState(4)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  const rangeDays = inclusiveDays(start, end)
  const dayCount = mode === 'dias' ? days : rangeDays
  const rangeError =
    mode === 'datas' && start && end
      ? rangeDays === 0
        ? 'A data final não pode ser antes da inicial.'
        : rangeDays > MAX_DAYS
          ? `A viagem pode ter no máximo ${MAX_DAYS} dias.`
          : null
      : null
  const valid =
    name.trim() !== '' && destination.trim() !== '' && dayCount >= 1 && dayCount <= MAX_DAYS && !rangeError

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    onCreate({
      name: name.trim(),
      destination: destination.trim(),
      dayCount,
      startDate: mode === 'datas' ? start : null,
    })
    setName('')
    setDestination(CITY_NAME)
    setMode('dias')
    setDays(4)
    setStart('')
    setEnd('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Criar nova viagem</DialogTitle>
            <DialogDescription>Dê um nome, escolha o lugar e a duração da viagem.</DialogDescription>
          </DialogHeader>

          <label className="block text-sm font-medium" htmlFor="nome-viagem">
            Nome da viagem
          </label>
          <input
            id="nome-viagem"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Viagem com os amigos"
            autoComplete="off"
            className={FIELD}
          />

          <label className="mt-4 block text-sm font-medium" htmlFor="destino">
            Lugar
          </label>
          <input
            id="destino"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ex.: Rio de Janeiro"
            autoComplete="off"
            className={FIELD}
          />

          <p className="mt-4 text-sm font-medium" id="duracao-label">
            Duração
          </p>
          <div
            role="group"
            aria-labelledby="duracao-label"
            className="mt-1.5 inline-flex rounded-full bg-muted p-0.5"
          >
            {(
              [
                ['dias', 'Número de dias'],
                ['datas', 'Datas exatas'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-all',
                  mode === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === 'dias' ? (
            <div className="mt-3 flex items-center gap-3" role="group" aria-label="Número de dias">
              <button
                type="button"
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                disabled={days <= 1}
                aria-label="Diminuir um dia"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="w-24 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                {days} {days === 1 ? 'dia' : 'dias'}
              </span>
              <button
                type="button"
                onClick={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
                disabled={days >= MAX_DAYS}
                aria-label="Aumentar um dia"
                className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-medium">
                  Ida
                  <input
                    type="date"
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value)
                      if (end && e.target.value > end) setEnd(e.target.value)
                    }}
                    className={FIELD}
                  />
                </label>
                <label className="text-sm font-medium">
                  Volta
                  <input type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className={FIELD} />
                </label>
              </div>
              <p className={cn('mt-2 text-sm', rangeError ? 'text-destructive' : 'text-muted-foreground')} aria-live="polite">
                {rangeError ?? (rangeDays > 0 ? `${rangeDays} ${rangeDays === 1 ? 'dia' : 'dias'} de viagem` : 'Escolha as datas de ida e volta.')}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="h-10 rounded-xl px-4" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid} className="h-10 rounded-xl px-4">
              Criar viagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
