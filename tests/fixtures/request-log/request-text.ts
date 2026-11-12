import { PI_REQUEST_LOG_NO_USER_MESSAGE, PI_REQUEST_LOG_TEXT_KIND, PI_REQUEST_LOG_USER_ROLE } from "./constants"
import { type PiProcessRequestLog } from "./types"

export function lastPiProcessUserText(request: PiProcessRequestLog): string {
  const message = request.messages.findLast((entry) => entry.role === PI_REQUEST_LOG_USER_ROLE)
  if (!message) {
    throw new Error(PI_REQUEST_LOG_NO_USER_MESSAGE)
  }
  if (typeof message.content === "string") {
    return message.content
  }
  let text = ""
  for (const part of message.content) {
    if (part.type === PI_REQUEST_LOG_TEXT_KIND && part.text) {
      text += part.text
    }
  }
  return text
}
