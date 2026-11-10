import { type ModelConfiguration } from "#evaluator/configuration"
import { readFailureDetail } from "#evaluator/http-failure"
import { ModelHttpError } from "./model-http-error"
import { postChat } from "./post-chat"
import { ensureCompleted, readSseStream } from "./sse"

async function ensureSuccess(response: Response): Promise<Response> {
  if (response.ok) {
    return response
  }
  throw new ModelHttpError(response.status, `Modelo respondeu ${response.status}: ${await readFailureDetail(response)}`)
}

export async function sendRequest(configuration: ModelConfiguration, prompt: string): Promise<string> {
  const response = await ensureSuccess(await postChat(configuration, prompt))
  if (response.body) {
    return ensureCompleted(await readSseStream(response.body))
  }
  throw new Error("O modelo respondeu sem corpo")
}
