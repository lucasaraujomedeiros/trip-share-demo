'use client'

import { useId, useState } from 'react'
import { ChevronRight, Copy, Heart, MapPin, MessageCircle, Route, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoGrid } from './social-photos'
import { tripItemCount, tripPeriod } from '@/lib/trip'
import { ME, type Post } from '@/lib/social'
import { cn } from '@/lib/utils'

type Props = {
  post: Post
  onToggleLike: (id: string) => void
  onAddComment: (id: string, text: string) => void
  onClone: (post: Post) => void
  onOpen: (id: string) => void
}

export function Avatar({ name, color, size = 'md' }: { name: string; color: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        size === 'md' ? 'size-10 text-sm' : 'size-8 text-xs',
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

export function PostCard({ post, onToggleLike, onAddComment, onClone, onOpen }: Props) {
  const [showComments, setShowComments] = useState(false)
  const [draft, setDraft] = useState('')
  const commentsId = useId()
  const { trip } = post
  const items = tripItemCount(trip)

  function submitComment(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onAddComment(post.id, text)
    setDraft('')
  }

  return (
    <article
      aria-label={`Postagem de ${post.author}`}
      className="rounded-3xl border bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-5"
    >
      <header className="flex items-center gap-3">
        <Avatar name={post.author} color={post.avatarColor} />
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{post.author}</p>
          <p className="text-xs text-muted-foreground">{post.postedLabel}</p>
        </div>
      </header>

      {post.text && <p className="mt-3 text-pretty">{post.text}</p>}

      {post.photos.length > 0 && (
        <div className="mt-3">
          <PhotoGrid photos={post.photos} />
        </div>
      )}

      <button
        type="button"
        onClick={() => onOpen(post.id)}
        aria-label={`Ver roteiro de ${trip.name}`}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border bg-muted/50 p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Route className="size-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{trip.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {trip.destination} · {tripPeriod(trip)} · {items} {items === 1 ? 'item' : 'itens'}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-muted-foreground">
          Ver roteiro
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      </button>

      <div className="mt-3 flex items-center gap-1">
        <button
          type="button"
          aria-pressed={post.likedByMe}
          aria-label={`Curtir (${post.likes} ${post.likes === 1 ? 'curtida' : 'curtidas'})`}
          onClick={() => onToggleLike(post.id)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent',
            post.likedByMe ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Heart className={cn('size-4', post.likedByMe && 'fill-current')} aria-hidden="true" />
          <span className="tabular-nums">{post.likes}</span>
        </button>
        <button
          type="button"
          aria-expanded={showComments}
          aria-controls={commentsId}
          aria-label={`Comentários (${post.comments.length})`}
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          <span className="tabular-nums">{post.comments.length}</span>
        </button>
        <Button variant="outline" className="ml-auto h-9 rounded-full px-4" onClick={() => onClone(post)}>
          <Copy className="size-4" aria-hidden="true" />
          Clonar
        </Button>
      </div>

      {showComments && (
        <div id={commentsId} className="mt-3 border-t pt-3">
          {post.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda não há comentários. Seja a primeira pessoa!</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {post.comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar name={c.author} color={c.author === ME.name ? ME.avatarColor : '#6A6A6A'} size="sm" />
                  <div className="min-w-0 rounded-2xl bg-muted px-3 py-2 text-sm">
                    <p className="font-semibold">
                      {c.author} <span className="text-xs font-normal text-muted-foreground">· {c.postedLabel}</span>
                    </p>
                    <p className="text-pretty">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Escrever comentário"
              placeholder="Escreva um comentário…"
              autoComplete="off"
              className="h-10 min-w-0 flex-1 rounded-full border bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
            <Button type="submit" disabled={!draft.trim()} className="h-10 rounded-full px-4">
              <Send className="size-4" aria-hidden="true" />
              Enviar
            </Button>
          </form>
        </div>
      )}
    </article>
  )
}
