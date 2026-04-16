import { describe, it, expect, vi } from "vitest"
import { createBranchProcessor } from "./branch"
import { createMessage } from "../message"
import type { PipelineContext, ProcessorFn } from "../types"

const ctx: PipelineContext = { httpHandler: async () => new Response(), env: {} }

describe("branch processor", () => {
  it("runs sub-processors as side effect, preserves original with result_map empty", async () => {
    const sideEffect = vi.fn(async (msg) => [msg])
    const proc = createBranchProcessor({ processors: [], result_map: "" }, [sideEffect])
    const msgs = await proc(createMessage({ original: true }), ctx)
    expect(msgs).toHaveLength(1)
    expect((msgs[0].content as any).original).toBe(true)
    expect(sideEffect).toHaveBeenCalled()
  })

  it("applies request_map jq to transform input for sub-processors", async () => {
    const captured: any[] = []
    const sideEffect: ProcessorFn = async (msg) => { captured.push(msg.content); return [msg] }
    const proc = createBranchProcessor({
      request_map: { jq: '{status: "generating"}' },
      processors: [],
      result_map: "",
    }, [sideEffect])
    await proc(createMessage({ original: true, status: "submitted" }), ctx)
    expect(captured[0]).toEqual({ status: "generating" })
  })
})
