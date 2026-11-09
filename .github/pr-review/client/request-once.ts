import { HttpStatusError, ModelError } from "../errors"
import { type Settings } from "../settings"
import { fillTemplate } from "../templates"
import { buildHeaders } from "./build-headers"
import { buildPayload } from "./build-payload"
import { collectContent } from "./collect-content"
import { CHAT_PATH, ERROR_EMPTY, ERROR_HTTP, METHOD_POST, TIMEOUT_MS } from "./constants"
import { type ChatMessage } from "./types"

export async function requestOnce(settings: Settings, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(settings.baseUrl + CHAT_PATH, {
    method: METHOD_POST,
    headers: buildHeaders(settings),
    body: JSON.stringify(buildPayload(settings, messages)),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new HttpStatusError(response.status, fillTemplate(ERROR_HTTP, [String(response.status)]))
  }
  if (response.body === null) {
    throw new ModelError(ERROR_EMPTY)
  }
  return collectContent(response.body)
}
