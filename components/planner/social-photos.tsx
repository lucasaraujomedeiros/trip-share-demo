import { Camera, Landmark, Mountain, Sunset, Utensils, Waves } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Fotos de exemplo: placeholders em gradiente (não há arquivos de imagem no projeto). */
export const PHOTOS = [
  { label: 'Cidade', className: 'from-[#FFB199] to-[#FF0844]', icon: Camera },
  { label: 'Natureza', className: 'from-[#84FAB0] to-[#2E8B57]', icon: Mountain },
  { label: 'Museu', className: 'from-[#A18CD1] to-[#5B3FD0]', icon: Landmark },
  { label: 'Pôr do sol', className: 'from-[#FFD66B] to-[#F2711C]', icon: Sunset },
  { label: 'Gastronomia', className: 'from-[#F6D365] to-[#FDA085]', icon: Utensils },
  { label: 'Praia', className: 'from-[#6DD5FA] to-[#2980B9]', icon: Waves },
] as const

export function PhotoTile({ index, className, iconClassName }: { index: number; className?: string; iconClassName?: string }) {
  const { className: gradient, icon: Icon } = PHOTOS[index % PHOTOS.length]
  return (
    <div className={cn('flex items-center justify-center bg-gradient-to-br', gradient, className)} aria-hidden="true">
      <Icon className={cn('size-10 text-white/90 drop-shadow', iconClassName)} />
    </div>
  )
}

export function PhotoGrid({ photos }: { photos: number[] }) {
  if (photos.length === 0) return null
  const count = Math.min(photos.length, 4)
  return (
    <div
      role="img"
      aria-label={`${count} ${count === 1 ? 'foto' : 'fotos'} da postagem`}
      className={cn(
        'grid h-60 gap-1.5 overflow-hidden rounded-2xl sm:h-72',
        count === 1 ? 'grid-cols-1' : 'grid-cols-2',
        count >= 3 && 'grid-rows-2',
      )}
    >
      {photos.slice(0, 4).map((p, i) => (
        <PhotoTile
          key={`${p}-${i}`}
          index={p}
          className={cn('size-full', count === 3 && i === 0 && 'row-span-2')}
          iconClassName={count === 1 ? 'size-16' : 'size-9'}
        />
      ))}
    </div>
  )
}
