import { type RouterConversation, type RouterMessage } from "#synapse/modules/model-router/public/contracts"
import { ROUTER_IMAGE_NOTICE } from "./constants"
import { currentRouterRequest, selectRouterHistory } from "./select-history"

export function buildRouterConversation(messages: readonly RouterMessage[]): RouterConversation {
  const current = currentRouterRequest(messages)
  const selected = selectRouterHistory(messages, current)
  return { ...current, history: selected.history, omittedMessages: selected.omitted, imageNotice: ROUTER_IMAGE_NOTICE }
}
