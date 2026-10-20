import { CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  tripName: string
  onOpen: () => void
  onDismiss: () => void
}

/** Confirmação exibida depois de clonar uma viagem. */
export function CloneNotice({ tripName, onOpen, onDismiss }: Props) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#BFE3C0] bg-[#F1FAF1] px-4 py-3 text-sm"
    >
      <CheckCircle2 className="size-5 shrink-0 text-[#008A05]" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-pretty">
        Viagem <span className="font-semibold">“{tripName}”</span> adicionada às suas viagens e definida como atual.
      </p>
      <Button variant="outline" className="h-8 rounded-full px-3" onClick={onOpen}>
        Abrir em Minhas Viagens
      </Button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar aviso"
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
