import { type AssistantMessage } from "@earendil-works/pi-ai"
import { PI_MODEL_REFERENCE_SEPARATOR } from "#synapse/integration/pi/model-reference"
import {
  MEMBER_ASSISTANT_RESPONSE,
  MEMBER_EXECUTION_SETTLED,
  type MemberAssistantResponse,
  type MemberExecutionSettled,
} from "#synapse/modules"
import { TEAM_PI_MEMBER_ERROR_REASON, TEAM_PI_MEMBER_RESPONSE_FAILURE } from "./constants"
import { type TeamMemberSessionPort } from "./types"

export function teamMemberAssistantResponse(message: AssistantMessage): MemberAssistantResponse {
  const response: MemberAssistantResponse = {
    kind: MEMBER_ASSISTANT_RESPONSE,
    model: `${message.provider}${PI_MODEL_REFERENCE_SEPARATOR}${message.model}`,
  }
  if (message.errorMessage) {
    response.failure = message.errorMessage
  } else if (message.stopReason === TEAM_PI_MEMBER_ERROR_REASON) {
    response.failure = TEAM_PI_MEMBER_RESPONSE_FAILURE
  }
  return response
}

export function teamMemberSettledResponse(session: TeamMemberSessionPort, aborted: boolean): MemberExecutionSettled {
  const settled: MemberExecutionSettled = { kind: MEMBER_EXECUTION_SETTLED, aborted }
  const answer = session.getLastAssistantText()
  if (answer) {
    settled.answer = answer
  }
  return settled
}
