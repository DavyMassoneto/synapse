import { ensureWithinLimit } from "./ensure-within-limit"
import { fillTemplate } from "./fill-template"
import { type PromptContext } from "./types"

export function buildPrompt(context: PromptContext, diff: string): string {
  return ensureWithinLimit(fillTemplate(context, diff))
}
