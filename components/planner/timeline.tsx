'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AlertTriangle, CheckCircle2, House, Moon, Sun, Sunrise, Sunset } from 'lucide-react'
import { TimelineCard } from './timeline-card'
import { SHIFTS, formatDuration, formatTime, shiftFor, type ShiftId } from '@/lib/trip'
import type { Itinerary, ScheduledStop } from '@/lib/scheduler'
import { cn } from '@/lib/utils'

export const SHIFT_STYLES: Record<
  ShiftId,
  { container: string; title: string; subtle: string; dark: boolean; icon: typeof Sun }
> = {
  manha: { container: 'bg-[#FFF5D1]', title: 'text-[#6B4D00]', subtle: 'text-[#8A6A12]', dark: false, icon: Sunrise },
  tarde: { container: 'bg-[#FFE7D6]', title: 'text-[#8A3407]', subtle: 'text-[#A4551F]', dark: false, icon: Sun },
  noite: { container: 'bg-[#E0F2FE]', title: 'text-[#075985]', subtle: 'text-[#0369A1]', dark: false, icon: Sunset },
  madrugada: { container: 'bg-[#2D1563]', title: 'text-white', subtle: 'text-white/70', dark: true, icon: Moon },
}

type Group = { shift: ShiftId; items: { item: ScheduledStop; index: number }[] }

function groupByShift(items: ScheduledStop[]) {
  const groups: Group[] = []
  items.forEach((item, index) => {
    const shift = shiftFor(item.start)
    const last = groups[groups.length - 1]
    if (last && last.shift === shift) last.items.push({ item, index })
    else groups.push({ shift, items: [{ item, index }] })
  })
  return groups
}

type Props = {
  itinerary: Itinerary
  onReorder: (ids: string[]) => void
  hoveredId: string | null
  onHover: (id: string | null) => void
}

export function Timeline({ itinerary, onReorder, hoveredId, onHover }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = itinerary.items.map((i) => i.stop.id)
  const groups = groupByShift(itinerary.items)
  const issues = itinerary.items.filter((i) => i.issue).length
  const lateReturn = itinerary.returnArrival > itinerary.returnLimit

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border p-3.5 text-sm',
          issues || lateReturn ? 'border-[#F5C2B3] bg-[#FFF4F0]' : 'bg-muted',
        )}
        role="status"
      >
        {issues || lateReturn ? (
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#008A05]" aria-hidden="true" />
        )}
        <p className="text-pretty">
          {issues || lateReturn ? (
            <>
              <span className="font-semibold">Atenção:</span>{' '}
              {issues > 0 && `${issues} ${issues === 1 ? 'parada não cabe' : 'paradas não cabem'} nas restrições. `}
              {lateReturn && `Retorno previsto às ${formatTime(itinerary.returnArrival)}, depois do limite.`}
            </>
          ) : (
            <>
              <span className="font-semibold">Tudo certo!</span> {itinerary.items.length} paradas, retorno previsto
              às {formatTime(itinerary.returnArrival)} (limite {formatTime(itinerary.returnLimit)}).
            </>
          )}
        </p>
      </div>

      <Endpoint icon={House} label="Saída da hospedagem" time={formatTime(itinerary.departure)} />

      <DndContext id="roteiro-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {groups.map((group, gi) => {
            const shift = SHIFTS[group.shift]
            const style = SHIFT_STYLES[group.shift]
            const Icon = style.icon
            return (
              <section
                key={`${group.shift}-${gi}`}
                aria-label={`${shift.label}, ${shift.range}`}
                className={cn('rounded-3xl p-3 sm:p-4', style.container)}
              >
                <header className="mb-2 flex items-center justify-between px-1">
                  <h3 className={cn('flex items-center gap-2 font-semibold', style.title)}>
                    <Icon className="size-4" aria-hidden="true" />
                    {shift.label}
                  </h3>
                  <span className={cn('text-xs font-medium tabular-nums', style.subtle)}>
                    {shift.range} · {group.items.length} {group.items.length === 1 ? 'parada' : 'paradas'}
                  </span>
                </header>
                <ol className="flex flex-col">
                  {group.items.map(({ item, index }) => (
                    <TimelineCard
                      key={item.stop.id}
                      item={item}
                      number={index + 1}
                      shift={group.shift}
                      dark={style.dark}
                      highlighted={hoveredId === item.stop.id}
                      onHover={onHover}
                    />
                  ))}
                </ol>
              </section>
            )
          })}
        </SortableContext>
      </DndContext>

      <Endpoint
        icon={House}
        label="Retorno à hospedagem"
        time={formatTime(itinerary.returnArrival)}
        detail={`${formatDuration(itinerary.returnTravel)} de deslocamento`}
        warn={lateReturn}
      />
    </div>
  )
}

function Endpoint({
  icon: Icon,
  label,
  time,
  detail,
  warn,
}: {
  icon: typeof House
  label: string
  time: string
  detail?: string
  warn?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
      <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
      <span className={cn('text-sm font-semibold tabular-nums', warn && 'text-destructive')}>{time}</span>
    </div>
  )
}
