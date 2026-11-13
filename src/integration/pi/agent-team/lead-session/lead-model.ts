import { type MessageEndEvent } from "@earendil-works/pi-coding-agent"
import {
  REFERENCE_SEPARATOR,
  TEAM_MODEL_KNOWN,
  TEAM_MODEL_UNAVAILABLE,
  type TeamModelReference,
  type TeamModelUse,
} from "#synapse/modules"
import { TEAM_PI_ASSISTANT_ROLE, TEAM_PI_CONTEXT_ATTACHED, TEAM_PI_THINKING_SEPARATOR } from "./constants"
import { type PiTeamLeadContext } from "./lead-context"

export class PiTeamLeadModel {
  private lastModel: TeamModelReference = { kind: TEAM_MODEL_UNAVAILABLE }

  private readonly context: PiTeamLeadContext

  constructor(context: PiTeamLeadContext) {
    this.context = context
  }

  detach(): void {
    this.context.detach()
    this.lastModel = { kind: TEAM_MODEL_UNAVAILABLE }
  }

  modelUse(): TeamModelUse {
    const state = this.context.current()
    if (state.kind === TEAM_PI_CONTEXT_ATTACHED) {
      const context = state.context
      if (context.model && context.thinkingLevel) {
        return {
          model: {
            kind: TEAM_MODEL_KNOWN,
            model: `${context.model.provider}${REFERENCE_SEPARATOR}${context.model.id}${TEAM_PI_THINKING_SEPARATOR}${context.thinkingLevel}`,
          },
          effectiveModel: this.lastModel,
        }
      }
    }
    return { model: { kind: TEAM_MODEL_UNAVAILABLE }, effectiveModel: this.lastModel }
  }

  recordMessage(event: MessageEndEvent): void {
    if (event.message.role === TEAM_PI_ASSISTANT_ROLE) {
      this.lastModel = {
        kind: TEAM_MODEL_KNOWN,
        model: `${event.message.provider}${REFERENCE_SEPARATOR}${event.message.model}`,
      }
    }
  }
}
