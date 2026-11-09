import { Value } from "typebox/value"
import { JSON_END, JSON_START, ReplySchema } from "./constants"
import { type Reply } from "./types"

export function parseReply(text: string): Reply {
  const start = text.indexOf(JSON_START)
  const end = text.lastIndexOf(JSON_END)
  try {
    return Value.Parse(ReplySchema, JSON.parse(text.slice(start, end + 1)))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Resposta do modelo fora do formato esperado: ${error.message}`, { cause: error })
    }
    throw error
  }
}
