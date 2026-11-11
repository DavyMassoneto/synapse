import { type ModelConfiguration } from "#evaluator/configuration"
import { ensureOk } from "#evaluator/http-failure"
import { EMPTY_BODY, MODEL_ORIGIN } from "./constants"
import { ensureCompleted } from "./ensure-completed"
import { postChat } from "./post-chat"
import { readSseStream } from "./sse"
import { type ChatRequest, type ModelReply } from "./types"

export async function sendRequest(configuration: ModelConfiguration, request: ChatRequest): Promise<ModelReply> {
  const response = await ensureOk(await postChat(configuration, request), MODEL_ORIGIN)
  if (response.body) {
    return ensureCompleted(await readSseStream(response.body))
  }
  throw new Error(EMPTY_BODY)
}
