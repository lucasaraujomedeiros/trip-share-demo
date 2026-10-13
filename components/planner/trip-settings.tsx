import { House, Moon } from 'lucide-react'

type Props = {
  departure: string
  onDepartureChange: (v: string) => void
  returnTime: string
  onReturnTimeChange: (v: string) => void
}

export function TripSettings({ departure, onDepartureChange, returnTime, onReturnTimeChange }: Props) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border shadow-sm">
      <label className="flex cursor-text flex-col gap-0.5 px-4 py-2.5 transition-colors focus-within:bg-accent hover:bg-accent">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          <House className="size-3.5" aria-hidden="true" />
          Saída da hospedagem
        </span>
        <input
          type="time"
          value={departure}
          onChange={(e) => e.target.value && onDepartureChange(e.target.value)}
          className="bg-transparent text-sm text-muted-foreground outline-none"
        />
      </label>
      <label className="flex cursor-text flex-col gap-0.5 border-l px-4 py-2.5 transition-colors focus-within:bg-accent hover:bg-accent">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          <Moon className="size-3.5" aria-hidden="true" />
          Horário de retorno
        </span>
        <input
          type="time"
          value={returnTime}
          onChange={(e) => e.target.value && onReturnTimeChange(e.target.value)}
          className="bg-transparent text-sm text-muted-foreground outline-none"
        />
      </label>
    </div>
  )
}
