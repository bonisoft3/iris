import type { ErrorComponentProps } from "@tanstack/react-router"
import * as m from "@/paraglide/messages"

export function ErrorFallback({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">{m.error_title()}</h2>
        <p className="mt-2 text-sm text-destructive">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90"
        >
          {m.error_retry()}
        </button>
      </div>
    </div>
  )
}
