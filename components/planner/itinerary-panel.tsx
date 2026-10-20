import { Timeline } from './timeline'
import { Button } from '@/components/ui/button'
import type { Itinerary } from '@/lib/scheduler'

type Props = {
  dayTitle: string
  itinerary: Itinerary | null
  onReorder: (ids: string[]) => void
  hoveredId: string | null
  onHover: (id: string | null) => void
  onGoPlanning: () => void
}

/** Linha do tempo arrastável de um único dia (usada em Dividido). */
export function ItineraryPanel({ dayTitle, itinerary, onReorder, hoveredId, onHover, onGoPlanning }: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Roteiro do {dayTitle}</h2>
        <p className="text-sm text-muted-foreground">Arraste os cards para reorganizar a ordem.</p>
      </div>
      {itinerary ? (
        <Timeline itinerary={itinerary} onReorder={onReorder} hoveredId={hoveredId} onHover={onHover} />
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <p className="font-medium">Este dia ainda não tem roteiro</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Monte o dia em Planejamento para fazer ajustes finos aqui.
          </p>
          <Button variant="outline" className="mt-4 h-9 rounded-full px-4" onClick={onGoPlanning}>
            Ir para Planejamento
          </Button>
        </div>
      )}
    </div>
  )
}
