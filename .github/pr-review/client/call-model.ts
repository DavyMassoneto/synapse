import { ModelError } from "../errors"
import { type RetryPolicy, retry } from "../retry"
import { type Settings } from "../settings"
import { BACKOFF_MS, MAX_ATTEMPTS } from "./constants"
import { isRetryable } from "./predicates"
import { type ChatMessage, ERROR_EMPTY, requestOnce } from "./request"
import { type ModelCaller } from "./types"

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

export function buildRetryPolicy(): RetryPolicy {
  return { attempts: MAX_ATTEMPTS, backoffMs: BACKOFF_MS, isRetryable }
}

export function createModelCaller(settings: Settings): ModelCaller {
  return (messages: ChatMessage[]) => callModel(settings, messages)
}
