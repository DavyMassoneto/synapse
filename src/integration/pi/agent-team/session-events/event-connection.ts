import { type AgentSessionEvent } from "@earendil-works/pi-coding-agent"
import {
  MEMBER_EXECUTION_STARTED,
  MEMBER_TOOL_ENDED,
  MEMBER_TOOL_STARTED,
  MEMBER_TURN_STARTED,
  type MemberSessionListener,
} from "#synapse/modules"
import { type TeamMemberExtensionLifetime } from "../extension-lifecycle"
import { teamMemberActivity } from "./activity-text"
import {
  TEAM_PI_MEMBER_AGENT_START,
  TEAM_PI_MEMBER_ASSISTANT_ROLE,
  TEAM_PI_MEMBER_MESSAGE_END,
  TEAM_PI_MEMBER_SETTLED,
  TEAM_PI_MEMBER_TOOL_END,
  TEAM_PI_MEMBER_TOOL_START,
  TEAM_PI_MEMBER_TURN_START,
} from "./constants"
import { teamMemberAssistantResponse, teamMemberSettledResponse } from "./session-response"
import { type TeamMemberSessionPort } from "./types"

export class PiTeamEventConnection {
  private readonly session: TeamMemberSessionPort

  private readonly listener: MemberSessionListener

  private readonly lifetime: TeamMemberExtensionLifetime

  constructor(session: TeamMemberSessionPort, listener: MemberSessionListener, lifetime: TeamMemberExtensionLifetime) {
    this.session = session
    this.listener = listener
    this.lifetime = lifetime
  }

  onEvent(event: AgentSessionEvent): void {
    switch (event.type) {
      case TEAM_PI_MEMBER_AGENT_START:
        this.listener({ kind: MEMBER_EXECUTION_STARTED })
        break
      case TEAM_PI_MEMBER_TURN_START:
        this.listener({ kind: MEMBER_TURN_STARTED })
        break
      case TEAM_PI_MEMBER_TOOL_START:
        this.listener({ kind: MEMBER_TOOL_STARTED, callId: event.toolCallId, label: teamMemberActivity(event) })
        break
      case TEAM_PI_MEMBER_TOOL_END:
        this.listener({ kind: MEMBER_TOOL_ENDED, callId: event.toolCallId })
        break
      case TEAM_PI_MEMBER_MESSAGE_END:
        if (event.message.role === TEAM_PI_MEMBER_ASSISTANT_ROLE) {
          this.listener(teamMemberAssistantResponse(event.message))
        }
        break
      case TEAM_PI_MEMBER_SETTLED:
        this.listener(teamMemberSettledResponse(this.session, event.aborted, this.lifetime))
        break
    }
  }
}
