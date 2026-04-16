import type { ProcessorStep, ProcessorFn } from "../types.js"
import { createJqProcessor } from "./jq.js"
import { createHttpProcessor } from "./http.js"
import { createBranchProcessor } from "./branch.js"
import { createUnarchiveProcessor } from "./unarchive.js"
import { createTryProcessor, createCatchProcessor } from "./try-catch.js"
import { createLogProcessor } from "./log.js"
import { createBloblangProcessor } from "./bloblang.js"

export function resolveProcessor(step: ProcessorStep): ProcessorFn {
  if ("jq" in step) {
    const query = typeof step.jq === "string" ? step.jq : step.jq.query
    return createJqProcessor(query)
  }
  if ("bloblang" in step) return createBloblangProcessor(step.bloblang)
  if ("http" in step) return createHttpProcessor(step.http)
  if ("unarchive" in step) return createUnarchiveProcessor(step.unarchive.format)
  if ("log" in step) return createLogProcessor(step.log)
  if ("try" in step) return createTryProcessor(step.try.map(resolveProcessor))
  if ("catch" in step) return createCatchProcessor(step.catch.map(resolveProcessor))
  if ("branch" in step) {
    const subProcessors = step.branch.processors.map(resolveProcessor)
    return createBranchProcessor(step.branch, subProcessors)
  }
  throw new Error(`Unknown processor: ${JSON.stringify(Object.keys(step))}`)
}
