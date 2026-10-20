'use client'

import { useId, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { Select } from '@/components/ui/select'

type Props = {
  name: string
  dayLabels: string[]
  added: boolean
  /** day: índice do dia ou null para "qualquer dia"; time: "HH:MM" ou null. */
  onAdd: (day: number | null, time: string | null) => void
}

export function AddPopover({ name, dayLabels, added, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState('any')
  const [time, setTime] = useState('')
  const id = useId()

  if (added) {
    return (
      <span
        className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
        role="img"
        aria-label={`${name} já foi adicionado`}
      >
        <Check className="size-4" aria-hidden="true" />
      </span>
    )
  }

  function confirm() {
    onAdd(day === 'any' ? null : Number(day), time || null)
    setOpen(false)
    setDay('any')
    setTime('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`Adicionar ${name}`}
        className="flex size-9 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Plus className="size-5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle className="mb-3">Adicionar à viagem</PopoverTitle>

        <label htmlFor={`${id}-dia`} className="mb-1.5 block text-sm font-medium">
          Dia preferido
        </label>
        <Select id={`${id}-dia`} value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="any">Qualquer dia</option>
          {dayLabels.map((label, i) => (
            <option key={i} value={i}>
              {label}
            </option>
          ))}
        </Select>

        <label htmlFor={`${id}-hora`} className="mt-3 mb-1.5 block text-sm font-medium">
          Horário preferido <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <input
          id={`${id}-hora`}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {day !== 'any' && time
            ? 'Vai direto para a linha do tempo do dia.'
            : day !== 'any'
              ? 'Vai para os não alocados do dia.'
              : 'Vai para os não alocados da viagem.'}
        </p>

        <Button onClick={confirm} className="mt-4 h-10 w-full rounded-xl">
          Adicionar
        </Button>
      </PopoverContent>
    </Popover>
  )
}
