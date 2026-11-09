import { Value } from "typebox/value"
import { CODE_FENCE, ReplySchema } from "./constants"
import { type Reply } from "./types"

function unwrapFence(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith(CODE_FENCE) && trimmed.endsWith(CODE_FENCE) && trimmed.length > CODE_FENCE.length * 2) {
    return trimmed.slice(trimmed.indexOf("\n") + 1, trimmed.length - CODE_FENCE.length).trim()
  }
  return trimmed
}

export function parseReply(text: string): Reply {
  try {
    return Value.Parse(ReplySchema, JSON.parse(unwrapFence(text)))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Resposta do modelo fora do formato esperado: ${error.message}`, { cause: error })
    }
    throw error
  }
}
