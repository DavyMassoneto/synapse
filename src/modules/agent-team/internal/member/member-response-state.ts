import {
  type MemberAssistantResponse,
  TEAM_MODEL_KNOWN,
  TEAM_MODEL_UNAVAILABLE,
  type TeamModelReference,
} from "#synapse/modules/agent-team/public/contracts"
import { TEAM_MEMBER_HAS_FAILURE, TEAM_MEMBER_NO_FAILURE } from "./constants"
import { type TeamMemberFailureState } from "./types"

export class TeamMemberResponseState {
  private model: TeamModelReference = { kind: TEAM_MODEL_UNAVAILABLE }

  private failureState: TeamMemberFailureState = { kind: TEAM_MEMBER_NO_FAILURE }

  constructor(lastModel?: string) {
    if (lastModel) {
      this.model = { kind: TEAM_MODEL_KNOWN, model: lastModel }
    }
  }

  get effectiveModel(): TeamModelReference {
    return this.model
  }

  get failure(): TeamMemberFailureState {
    return this.failureState
  }

  clearFailure(): void {
    this.failureState = { kind: TEAM_MEMBER_NO_FAILURE }
  }

  record(event: MemberAssistantResponse): void {
    this.model = { kind: TEAM_MODEL_KNOWN, model: event.model }
    if (event.failure) {
      this.failureState = { kind: TEAM_MEMBER_HAS_FAILURE, message: event.failure }
    } else {
      this.clearFailure()
    }
  }
}
