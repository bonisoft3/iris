import type { PipelineMessage, ProcessorFn, PipelineContext } from "../types.js"

export function createTryProcessor(subProcessors: ProcessorFn[]): ProcessorFn {
  return async (msg: PipelineMessage, ctx: PipelineContext): Promise<PipelineMessage[]> => {
    let msgs = [msg]
    for (const proc of subProcessors) {
      const nextMsgs: PipelineMessage[] = []
      for (const m of msgs) {
        nextMsgs.push(...await proc(m, ctx))
      }
      msgs = nextMsgs
    }
    return msgs
  }
}

export function createCatchProcessor(subProcessors: ProcessorFn[]): ProcessorFn {
  return async (msg: PipelineMessage, ctx: PipelineContext): Promise<PipelineMessage[]> => {
    let msgs = [msg]
    for (const proc of subProcessors) {
      const nextMsgs: PipelineMessage[] = []
      for (const m of msgs) {
        nextMsgs.push(...await proc(m, ctx))
      }
      msgs = nextMsgs
    }
    return msgs
  }
}
