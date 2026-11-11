import { type Context, type ModelsSimpleStreamOptions } from "@earendil-works/pi-ai"
import { type ModelRequest, type ResolvedModel } from "#synapse/modules"
import { TEXT_CONTENT } from "../content-text"
import { NO_REASONING, PROMPT_ROLE } from "./constants"

export function consultationContext(request: ModelRequest): Context {
  return {
    systemPrompt: request.system,
    messages: [{ role: PROMPT_ROLE, content: [{ type: TEXT_CONTENT, text: request.prompt }], timestamp: Date.now() }],
  }
}

export function consultationOptions(resolved: ResolvedModel, request: ModelRequest): ModelsSimpleStreamOptions {
  const options: ModelsSimpleStreamOptions = { signal: request.signal }
  if (resolved.effectiveThinking !== NO_REASONING) {
    options.reasoning = resolved.effectiveThinking
  }
  return options
}
