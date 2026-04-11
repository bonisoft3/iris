import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultErrorComponent: ({ error, reset }) => (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
        <p className="text-sm text-gray-600">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    ),
    defaultNotFoundComponent: () => (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8">
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-sm text-gray-600">The page you are looking for does not exist.</p>
      </div>
    ),
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
