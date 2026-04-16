import type { PipelineMessage, ProcessorFn, HttpProcessorConfig, PipelineContext } from "../types.js"
import { createMessage, interpolate } from "../message.js"

/**
 * Create an HTTP processor that sends the message content as a JSON POST/PATCH/PUT
 * and replaces the message with the response body.
 */
export function createHttpProcessor(config: HttpProcessorConfig): ProcessorFn {
  return async (msg: PipelineMessage, ctx: PipelineContext): Promise<PipelineMessage[]> => {
    const url = interpolate(config.url, msg, ctx.env)

    // Make URL absolute if relative (for browser fetch)
    const fullUrl = url.startsWith("http") ? url : `http://localhost${url}`

    const req = new Request(fullUrl, {
      method: config.verb.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(msg.content),
    })

    const res = await ctx.httpHandler(req)

    let responseContent: unknown
    const contentType = res.headers.get("Content-Type") ?? ""
    if (contentType.includes("json")) {
      responseContent = await res.json()
    } else {
      responseContent = await res.text()
    }

    return [createMessage(responseContent, { ...msg.metadata })]
  }
}
