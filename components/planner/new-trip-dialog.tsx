'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CITY_NAME } from '@/lib/trip'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  replacing: boolean
  onCreate: (destination: string, days: number) => void
}

export function NewTripDialog({ open, onOpenChange, replacing, onCreate }: Props) {
  const [destination, setDestination] = useState(CITY_NAME)
  const [days, setDays] = useState(4)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const name = destination.trim()
    if (!name) return
    onCreate(name, days)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Criar nova viagem</DialogTitle>
            <DialogDescription>
              {replacing
                ? 'Atenção: a viagem atual e todos os itens adicionados serão substituídos.'
                : 'Escolha o destino e quantos dias vai durar a viagem.'}
            </DialogDescription>
          </DialogHeader>

          <label className="block text-sm font-medium" htmlFor="destino">
            Destino
          </label>
          <input
            id="destino"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ex.: Rio de Janeiro"
            autoComplete="off"
            className="mt-1.5 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />

          <p className="mt-4 text-sm font-medium" id="dias-label">
            Número de dias
          </p>
          <div className="mt-1.5 flex items-center gap-3" role="group" aria-labelledby="dias-label">
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
              onClick={() => setDays((d) => Math.min(14, d + 1))}
              disabled={days >= 14}
              aria-label="Aumentar um dia"
              className="flex size-9 items-center justify-center rounded-full border transition-colors hover:border-foreground disabled:opacity-30 disabled:hover:border-border"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="h-10 rounded-xl px-4" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!destination.trim()} className="h-10 rounded-xl px-4">
              Criar viagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
