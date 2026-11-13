import { type AssistantMessage } from "@earendil-works/pi-ai"
import {
  MEMBER_ASSISTANT_RESPONSE,
  MEMBER_EXECUTION_SETTLED,
  type MemberAssistantResponse,
  type MemberExecutionSettled,
  REFERENCE_SEPARATOR,
} from "#synapse/modules"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import { TEAM_PI_MEMBER_ERROR_REASON, TEAM_PI_MEMBER_RESPONSE_FAILURE } from "./constants"
import { type TeamMemberSessionPort } from "./types"

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

export function teamMemberSettledResponse(
  session: TeamMemberSessionPort,
  aborted: boolean,
  lifetime: TeamMemberExtensionLifetime,
): MemberExecutionSettled {
  const settled: MemberExecutionSettled = { kind: MEMBER_EXECUTION_SETTLED, aborted }
  const answer = session.getLastAssistantText()
  if (answer) {
    settled.answer = answer
  }
  try {
    lifetime.ensureHealthy()
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error
    }
    settled.failure = error.message
  }
  return settled
}
