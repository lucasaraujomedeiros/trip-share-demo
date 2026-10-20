import { CalendarDays, Heart, Plane, User } from 'lucide-react'
import { tripItemCount, type Trip } from '@/lib/trip'

export function ProfilePage({ trips }: { trips: Trip[] }) {
  const stats = [
    { icon: Plane, label: 'Viagens', value: trips.length },
    { icon: CalendarDays, label: 'Dias planejados', value: trips.reduce((sum, t) => sum + t.days.length, 0) },
    { icon: Heart, label: 'Itens salvos', value: trips.reduce((sum, t) => sum + tripItemCount(t), 0) },
  ]

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <div className="flex items-center gap-4">
          <span className="flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="size-9" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ana Souza</h1>
            <p className="text-sm text-muted-foreground">Exploradora desde 2026 · São Paulo, Brasil</p>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <li key={label} className="rounded-2xl border p-4">
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Em breve: viagens anteriores, lugares favoritos e compartilhamento de roteiros com amigos.
        </p>
      </div>
    </div>
  )
}
