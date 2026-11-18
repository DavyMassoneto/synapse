import { MEMBER_ASSISTANT_RESPONSE, type MemberSessionEvent } from "#synapse/modules/agent-team/public/contracts"
import { type ObservedRun } from "./types"

export function isActiveObservedExecutionEvent(run: ObservedRun, event: MemberSessionEvent): boolean {
  return !run.ended && event.kind !== MEMBER_ASSISTANT_RESPONSE && event.executionId === run.executionId
}
