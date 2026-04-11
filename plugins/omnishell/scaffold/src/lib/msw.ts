import { http, HttpResponse } from "msw"
import { setupWorker } from "msw/browser"
import { auth } from "./auth"

const handlers = [
  http.all("/auth/*", async ({ request }) => {
    const response = await auth.handleRequest(request)
    // Clone the response to extract headers properly
    const body = await response.text()
    return new HttpResponse(body, {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    })
  }),
]

export const worker = setupWorker(...handlers)
