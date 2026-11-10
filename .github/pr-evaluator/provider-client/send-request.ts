import { type ModelConfiguration } from "#evaluator/configuration"
import { ensureOk } from "#evaluator/http-failure"
import { MODEL_ORIGIN } from "./constants"
import { postChat } from "./post-chat"
import { ensureCompleted, readSseStream } from "./sse"

export async function sendRequest(configuration: ModelConfiguration, prompt: string): Promise<string> {
  const response = await ensureOk(await postChat(configuration, prompt), MODEL_ORIGIN)
  if (response.body) {
    return ensureCompleted(await readSseStream(response.body))
  }
  throw new Error("O modelo respondeu sem corpo")
}
