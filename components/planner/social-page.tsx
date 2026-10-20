'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CloneNotice } from './clone-notice'
import { NewPostDialog, type NewPostInput } from './new-post-dialog'
import { PostCard } from './post-card'
import { tripItemCount, type Trip } from '@/lib/trip'
import type { Post } from '@/lib/social'

type Props = {
  posts: Post[]
  trips: Trip[]
  currentId: string | null
  onToggleLike: (id: string) => void
  onAddComment: (id: string, text: string) => void
  /** Clona o post e devolve a nova viagem. */
  onClone: (post: Post) => Trip
  onOpenPost: (id: string) => void
  onOpenTrip: (id: string) => void
  onPublish: (input: NewPostInput) => void
}

export function SocialPage({
  posts,
  trips,
  currentId,
  onToggleLike,
  onAddComment,
  onClone,
  onOpenPost,
  onOpenTrip,
  onPublish,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notice, setNotice] = useState<{ id: string; name: string } | null>(null)
  const eligible = useMemo(() => trips.filter((t) => tripItemCount(t) > 0), [trips])

  function clone(post: Post) {
    const copy = onClone(post)
    setNotice({ id: copy.id, name: copy.name })
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-muted/40">
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Social</h1>
            <p className="text-sm text-muted-foreground">Roteiros de outros viajantes. Curta, comente e clone.</p>
          </div>
          <Button className="h-9 rounded-full px-4" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Nova postagem
          </Button>
        </div>

        {notice && (
          <div className="mb-4">
            <CloneNotice tripName={notice.name} onOpen={() => onOpenTrip(notice.id)} onDismiss={() => setNotice(null)} />
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                onToggleLike={onToggleLike}
                onAddComment={onAddComment}
                onClone={clone}
                onOpen={onOpenPost}
              />
            </li>
          ))}
        </ul>
      </div>

      <NewPostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trips={eligible}
        currentId={currentId}
        onPublish={onPublish}
      />
    </div>
  )
}
