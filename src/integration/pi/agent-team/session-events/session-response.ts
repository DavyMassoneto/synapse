import { type AssistantMessage } from "@earendil-works/pi-ai"
import {
  MEMBER_ASSISTANT_RESPONSE,
  MEMBER_EXECUTION_SETTLED,
  type MemberAssistantResponse,
  type MemberExecutionSettled,
  REFERENCE_SEPARATOR,
} from "#synapse/modules"
import { TEAM_PI_MEMBER_ERROR_REASON, TEAM_PI_MEMBER_RESPONSE_FAILURE } from "./constants"

export function teamMemberAssistantResponse(message: AssistantMessage): MemberAssistantResponse {
  const response: MemberAssistantResponse = {
    kind: MEMBER_ASSISTANT_RESPONSE,
    model: `${message.provider}${REFERENCE_SEPARATOR}${message.model}`,
  }
  if (message.errorMessage) {
    response.failure = message.errorMessage
  } else if (message.stopReason === TEAM_PI_MEMBER_ERROR_REASON) {
    response.failure = TEAM_PI_MEMBER_RESPONSE_FAILURE
  }
  return response
}

export function teamMemberSettledResponse(aborted: boolean, answer?: string): MemberExecutionSettled {
  const settled: MemberExecutionSettled = { kind: MEMBER_EXECUTION_SETTLED, aborted }
  if (answer) {
    settled.answer = answer
  }
  return settled
}
