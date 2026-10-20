'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { PHOTOS, PhotoTile } from './social-photos'
import { tripItemCount, tripPeriod, type Trip } from '@/lib/trip'
import { cn } from '@/lib/utils'

export type NewPostInput = { tripId: string; text: string; photos: number[] }

const MAX_PHOTOS = 4

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Apenas viagens que têm pelo menos um item. */
  trips: Trip[]
  currentId: string | null
  onPublish: (input: NewPostInput) => void
}

export function NewPostDialog({ open, onOpenChange, trips, currentId, onPublish }: Props) {
  const [tripId, setTripId] = useState('')
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<number[]>([])

  // Ao abrir, pré-seleciona a viagem atual (ou a primeira elegível).
  useEffect(() => {
    if (!open) return
    setTripId((prev) => (trips.some((t) => t.id === prev) ? prev : (trips.find((t) => t.id === currentId) ?? trips[0])?.id ?? ''))
  }, [open, trips, currentId])

  function togglePhoto(index: number) {
    setPhotos((prev) =>
      prev.includes(index) ? prev.filter((p) => p !== index) : prev.length < MAX_PHOTOS ? [...prev, index] : prev,
    )
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!tripId) return
    onPublish({ tripId, text: text.trim(), photos })
    setText('')
    setPhotos([])
    onOpenChange(false)
  }

  const selected = trips.find((t) => t.id === tripId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Nova postagem</DialogTitle>
            <DialogDescription>Compartilhe uma das suas viagens com a comunidade.</DialogDescription>
          </DialogHeader>

          {trips.length === 0 ? (
            <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
              Você ainda não tem viagens com itens. Adicione atrações a uma viagem em Explorar para poder compartilhá-la.
            </p>
          ) : (
            <>
              <label htmlFor="post-viagem" className="mb-1.5 block text-sm font-medium">
                Viagem
              </label>
              <Select id="post-viagem" value={tripId} onChange={(e) => setTripId(e.target.value)}>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
              {selected && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {selected.destination} · {tripPeriod(selected)} · {tripItemCount(selected)} itens
                </p>
              )}

              <label htmlFor="post-texto" className="mt-4 mb-1.5 block text-sm font-medium">
                Texto <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <textarea
                id="post-texto"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={400}
                placeholder="Conte como foi ou dê dicas para quem for clonar…"
                className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />

              <p className="mt-4 mb-1.5 text-sm font-medium" id="post-fotos">
                Fotos <span className="font-normal text-muted-foreground">(simuladas · {photos.length}/{MAX_PHOTOS})</span>
              </p>
              <ul role="group" aria-labelledby="post-fotos" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PHOTOS.map((photo, i) => {
                  const on = photos.includes(i)
                  return (
                    <li key={photo.label}>
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`Foto: ${photo.label}`}
                        onClick={() => togglePhoto(i)}
                        className={cn(
                          'relative block aspect-square w-full overflow-hidden rounded-xl outline-offset-2 transition-all focus-visible:outline-2',
                          on ? 'ring-2 ring-foreground' : 'opacity-80 hover:opacity-100',
                        )}
                      >
                        <PhotoTile index={i} className="size-full" iconClassName="size-6" />
                        {on && (
                          <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="h-10 rounded-xl px-4" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!tripId} className="h-10 rounded-xl px-4">
              Publicar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
