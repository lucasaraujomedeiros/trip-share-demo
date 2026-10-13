import { Camera, Landmark, Utensils } from 'lucide-react'
import type { Category } from '@/lib/trip'
import { cn } from '@/lib/utils'

const ICONS = { atracao: Camera, museu: Landmark, refeicao: Utensils }

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = ICONS[category]
  return <Icon className={cn('size-4', className)} aria-hidden="true" />
}
