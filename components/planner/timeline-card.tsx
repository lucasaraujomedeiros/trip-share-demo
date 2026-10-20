'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, Car, GripVertical, Hourglass, Lock } from 'lucide-react'
import { CategoryIcon } from './category-icon'
import {
  CATEGORY_LABEL,
  SHIFTS,
  describeConstraint,
  formatDuration,
  formatTime,
  type ShiftId,
} from '@/lib/trip'
import type { ScheduledStop } from '@/lib/scheduler'
import { cn } from '@/lib/utils'

type Props = {
  item: ScheduledStop
  number: number
  shift: ShiftId
  dark: boolean
  highlighted: boolean
  onHover: (id: string | null) => void
  readOnly?: boolean
}

export function TimelineCard({ item, number, shift, dark, highlighted, onHover, readOnly }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.stop.id,
    disabled: readOnly,
  })
  const { stop } = item
  const color = SHIFTS[shift].color
  const constraint = describeConstraint(stop.constraint)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('relative', isDragging && 'z-10')}
    >
      <div
        className={cn(
          'flex items-center gap-1.5 py-1.5 pl-12 text-xs',
          dark ? 'text-white/70' : 'text-foreground/60',
        )}
      >
        <Car className="size-3.5" aria-hidden="true" />
        <span>{formatDuration(item.travelMin)} de deslocamento</span>
        {item.waitMin > 4 && (
          <>
            <span aria-hidden="true">·</span>
            <Hourglass className="size-3.5" aria-hidden="true" />
            <span>{formatDuration(item.waitMin)} livre</span>
          </>
        )}
      </div>

      <article
        onMouseEnter={() => onHover(stop.id)}
        onMouseLeave={() => onHover(null)}
        className={cn(
          'flex items-stretch gap-3 rounded-2xl bg-card p-3 text-card-foreground transition-shadow',
          isDragging
            ? 'shadow-[0_12px_32px_rgba(0,0,0,0.25)]'
            : highlighted
              ? 'shadow-[0_6px_20px_rgba(0,0,0,0.16)]'
              : 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
        )}
      >
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
          )}
          style={{ backgroundColor: color, color: SHIFTS[shift].onColor }}
          aria-label={`Parada ${number}`}
        >
          {number}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tabular-nums">
            {formatTime(item.start)} – {formatTime(item.end)}
          </p>
          <h4 className="truncate font-medium leading-snug">{stop.name}</h4>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CategoryIcon category={stop.category} className="size-3.5" />
            {CATEGORY_LABEL[stop.category]} · {formatDuration(stop.durationMin)}
          </p>
          {(constraint || item.issue) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {constraint && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                  <Lock className="size-3" aria-hidden="true" />
                  {constraint}
                </span>
              )}
              {item.issue && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4F0] px-2 py-0.5 text-[11px] font-medium text-destructive">
                  <AlertTriangle className="size-3" aria-hidden="true" />
                  {item.issue}
                </span>
              )}
            </div>
          )}
        </div>

        {!readOnly && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Arrastar ${stop.name} para reordenar`}
          className="-my-1 -mr-1 flex w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
        )}
      </article>
    </li>
  )
}
