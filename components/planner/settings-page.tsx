import { TripSettings } from './trip-settings'

type Props = {
  departure: string
  onDepartureChange: (v: string) => void
  returnTime: string
  onReturnTimeChange: (v: string) => void
}

export function SettingsPage(props: Props) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">Preferências usadas para montar os roteiros de todos os dias.</p>

        <section className="mt-6" aria-labelledby="horarios">
          <h2 id="horarios" className="mb-1 font-semibold">
            Horários padrão
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Defina quando você sai da hospedagem e até que horas precisa estar de volta.
          </p>
          <TripSettings
            departure={props.departure}
            onDepartureChange={props.onDepartureChange}
            returnTime={props.returnTime}
            onReturnTimeChange={props.onReturnTimeChange}
          />
        </section>

        <section className="mt-8" aria-labelledby="idioma">
          <h2 id="idioma" className="mb-3 font-semibold">
            Idioma e região
          </h2>
          <div className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm">
            <span>Idioma</span>
            <span className="text-muted-foreground">Português (Brasil)</span>
          </div>
        </section>
      </div>
    </div>
  )
}
