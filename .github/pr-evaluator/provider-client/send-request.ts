import { type ModelConfiguration } from "#evaluator/configuration"
import { ensureSuccess } from "./ensure-success"
import { postChat } from "./post-chat"
import { requireBody } from "./require-body"
import { ensureCompleted, readSseStream } from "./sse"

export async function sendRequest(configuration: ModelConfiguration, prompt: string): Promise<string> {
  const response = await ensureSuccess(await postChat(configuration, prompt))
  const streamed = await readSseStream(requireBody(response))
  return ensureCompleted(streamed)
}
