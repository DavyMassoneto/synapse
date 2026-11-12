import { type RouterMessage } from "#synapse/modules/model-router/public/contracts"
import { redactRouterCredentials } from "../credential-redaction"
import {
  ROUTER_CALL_SEPARATOR,
  ROUTER_CLIP_CHAR_DIVISOR,
  ROUTER_CLIP_RESERVE_BYTES,
  ROUTER_IMAGE_MARKER,
  ROUTER_MESSAGE_BREAK,
  ROUTER_OMISSION_MARKER,
  ROUTER_RESULT_ERROR_LABEL,
} from "./constants"

export function boundRouterText(text: string, bytes: number): string {
  if (Buffer.byteLength(text) <= bytes) {
    return text
  }
  const chars = Math.max(0, Math.floor((bytes - ROUTER_CLIP_RESERVE_BYTES) / ROUTER_CLIP_CHAR_DIVISOR))
  return text.slice(0, chars) + ROUTER_OMISSION_MARKER + text.slice(text.length - chars)
}

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
