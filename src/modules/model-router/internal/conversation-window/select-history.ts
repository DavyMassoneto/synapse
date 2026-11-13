import { type RouterHistoryEntry, type RouterMessage } from "#synapse/modules/model-router/public/contracts"
import { boundRouterText } from "./bound-text"
import {
  ROUTER_CONTEXT_BYTES,
  ROUTER_HISTORY_INCLUDED,
  ROUTER_HISTORY_OMITTED,
  ROUTER_MESSAGE_BYTES,
  ROUTER_MINIMUM_HISTORY_BYTES,
  ROUTER_NO_USER_MESSAGE,
  ROUTER_USER_ROLE,
} from "./constants"
import { renderRouterMessage } from "./render-message"
import { type RouterCurrentRequest, type RouterHistoryFit, type RouterSelectedHistory } from "./types"

export function currentRouterRequest(messages: readonly RouterMessage[]): RouterCurrentRequest {
  const currentIndex = messages.findLastIndex((message) => message.role === ROUTER_USER_ROLE)
  const current = messages[currentIndex]
  if (!current) {
    return { currentRequest: ROUTER_NO_USER_MESSAGE }
  }
  return { currentIndex, currentRequest: boundRouterText(renderRouterMessage(current), ROUTER_MESSAGE_BYTES) }
}

export function selectRouterHistory(
  messages: readonly RouterMessage[],
  current: RouterCurrentRequest,
): RouterSelectedHistory {
  const history: RouterHistoryEntry[] = []
  let remaining = ROUTER_CONTEXT_BYTES - Buffer.byteLength(current.currentRequest)
  let omitted = 0
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (index !== current.currentIndex && message) {
      const fitted = fitRouterHistoryMessage(message, index, remaining)
      if (fitted.kind === ROUTER_HISTORY_INCLUDED) {
        history.push(fitted.entry)
        remaining -= fitted.bytes
      } else {
        omitted += 1
      }
    }
  }
  return { history: history.reverse(), omitted }
}

function fitRouterHistoryMessage(message: RouterMessage, index: number, remaining: number): RouterHistoryFit {
  if (remaining < ROUTER_MINIMUM_HISTORY_BYTES) {
    return { kind: ROUTER_HISTORY_OMITTED }
  }
  const content = boundRouterText(renderRouterMessage(message), Math.min(ROUTER_MESSAGE_BYTES, remaining))
  const entry = { index, role: message.role, content }
  const bytes = Buffer.byteLength(JSON.stringify(entry))
  if (bytes > remaining) {
    return { kind: ROUTER_HISTORY_OMITTED }
  }
  return { kind: ROUTER_HISTORY_INCLUDED, entry, bytes }
}
