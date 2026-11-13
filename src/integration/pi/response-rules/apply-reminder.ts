import { type ContextEvent } from "@earendil-works/pi-coding-agent"
import {
  RESPONSE_RULES_ABSENT,
  RESPONSE_RULES_APPLIED,
  RESPONSE_RULES_REMINDER_CLOSE,
  RESPONSE_RULES_REMINDER_OPEN,
  RESPONSE_RULES_TEXT_CONTENT,
  RESPONSE_RULES_USER_ROLE,
} from "./constants"
import { type ResponseRulesApplyResult, type ResponseRulesBlocks, type ResponseRulesContent } from "./types"

function toResponseRulesBlocks(content: ResponseRulesContent): ResponseRulesBlocks {
  if (typeof content === "string") {
    return [{ type: RESPONSE_RULES_TEXT_CONTENT, text: content }]
  }
  return content
}

function appendResponseRulesReminder(content: ResponseRulesContent, text: string): ResponseRulesBlocks {
  return [
    ...toResponseRulesBlocks(content),
    {
      type: RESPONSE_RULES_TEXT_CONTENT,
      text: `${RESPONSE_RULES_REMINDER_OPEN}${text}${RESPONSE_RULES_REMINDER_CLOSE}`,
    },
  ]
}

export function applyResponseRulesReminder(messages: ContextEvent["messages"], text: string): ResponseRulesApplyResult {
  const index = messages.findLastIndex((candidate) => candidate.role === RESPONSE_RULES_USER_ROLE)
  const message = messages[index]
  if (message?.role === RESPONSE_RULES_USER_ROLE) {
    const content = appendResponseRulesReminder(message.content, text)
    const updated = messages.slice()
    updated[index] = { ...message, content }
    return { kind: RESPONSE_RULES_APPLIED, messages: updated }
  }
  return { kind: RESPONSE_RULES_ABSENT }
}
