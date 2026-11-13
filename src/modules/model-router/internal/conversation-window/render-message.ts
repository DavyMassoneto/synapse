import { type RouterMessage } from "#synapse/modules/model-router/public/contracts"
import { redactRouterCredentials } from "../credential-redaction"
import {
  ROUTER_CALL_SEPARATOR,
  ROUTER_IMAGE_MARKER,
  ROUTER_MESSAGE_BREAK,
  ROUTER_RESULT_ERROR_LABEL,
} from "./constants"

export function renderRouterMessage(message: RouterMessage): string {
  let text = message.text
  for (const call of message.calls) {
    text += `${ROUTER_MESSAGE_BREAK}${call.name}${ROUTER_CALL_SEPARATOR}${call.arguments}${ROUTER_MESSAGE_BREAK}`
  }
  if (message.image) {
    text += ROUTER_IMAGE_MARKER
  }
  if (message.result) {
    text = `${message.result.name}${ROUTER_RESULT_ERROR_LABEL}${message.result.error}${ROUTER_MESSAGE_BREAK}${text}`
  }
  return redactRouterCredentials(text)
}
