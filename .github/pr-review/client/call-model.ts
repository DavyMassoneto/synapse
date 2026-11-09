import { ModelError } from "../errors"
import { retry } from "../retry"
import { type Settings } from "../settings"
import { buildRetryPolicy } from "./build-retry-policy"
import { ERROR_EMPTY } from "./constants"
import { requestOnce } from "./request-once"
import { type ChatMessage } from "./types"

export async function callModel(settings: Settings, messages: ChatMessage[]): Promise<string> {
  let text: string
  try {
    text = await retry(() => requestOnce(settings, messages), buildRetryPolicy())
  } catch (error) {
    if (error instanceof Error) {
      throw new ModelError(error.message)
    }
    throw error
  }
  if (text.trim().length === 0) {
    throw new ModelError(ERROR_EMPTY)
  }
  return text.trim()
}
