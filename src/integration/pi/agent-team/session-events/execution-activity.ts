import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type AgentSessionEvent } from "@earendil-works/pi-coding-agent"
import {
  MEMBER_ACTIVITY_SETTLED,
  MEMBER_ACTIVITY_STARTED,
  MEMBER_ACTIVITY_TOOL_END,
  MEMBER_ACTIVITY_TOOL_START,
  MEMBER_ACTIVITY_TOOL_UPDATE,
  MEMBER_ACTIVITY_UPDATED,
  MEMBER_EXECUTION_ACTIVITY,
  type MemberActivityPhase,
  type MemberSessionListener,
  type MemberToolActivityPhase,
} from "#synapse/modules/agent-team"
import {
  TEAM_PI_ACTIVITY_AGENT_SETTLED,
  TEAM_PI_ACTIVITY_AGENT_START,
  TEAM_PI_ACTIVITY_AUTO_RETRY_END,
  TEAM_PI_ACTIVITY_AUTO_RETRY_START,
  TEAM_PI_ACTIVITY_COMPACTION_END,
  TEAM_PI_ACTIVITY_COMPACTION_START,
  TEAM_PI_ACTIVITY_MESSAGE_END,
  TEAM_PI_ACTIVITY_MESSAGE_START,
  TEAM_PI_ACTIVITY_MESSAGE_UPDATE,
  TEAM_PI_ACTIVITY_TEXT,
  TEAM_PI_ACTIVITY_THINKING,
  TEAM_PI_ACTIVITY_TOOL_EXECUTION_END,
  TEAM_PI_ACTIVITY_TOOL_EXECUTION_START,
  TEAM_PI_ACTIVITY_TOOL_EXECUTION_UPDATE,
  TEAM_PI_MEMBER_ASSISTANT_ROLE,
} from "./constants"
import { type TeamMemberExecutionState } from "./types"

export class PiMemberExecutionActivity {
  constructor(state: TeamMemberExecutionState, listener: MemberSessionListener) {
    this.state = state
    this.listener = listener
  }

  private readonly state: TeamMemberExecutionState

  private readonly listener: MemberSessionListener
  private active = false

  record(event: AgentSessionEvent): void {
    switch (event.type) {
      case TEAM_PI_ACTIVITY_AGENT_START:
        this.start()
        break
      case TEAM_PI_ACTIVITY_AGENT_SETTLED:
        this.settle()
        break
      case TEAM_PI_ACTIVITY_MESSAGE_START:
      case TEAM_PI_ACTIVITY_MESSAGE_UPDATE:
      case TEAM_PI_ACTIVITY_MESSAGE_END:
        if (event.message.role === TEAM_PI_MEMBER_ASSISTANT_ROLE) {
          this.message(event.message)
        }
        break
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_START:
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_UPDATE:
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_END:
        this.tool(event)
        break
      case TEAM_PI_ACTIVITY_AUTO_RETRY_START:
      case TEAM_PI_ACTIVITY_AUTO_RETRY_END:
      case TEAM_PI_ACTIVITY_COMPACTION_START:
      case TEAM_PI_ACTIVITY_COMPACTION_END:
        this.update()
        break
    }
  }

  private tool(event: AgentSessionEvent): void {
    if (
      event.type === TEAM_PI_ACTIVITY_TOOL_EXECUTION_START ||
      event.type === TEAM_PI_ACTIVITY_TOOL_EXECUTION_UPDATE ||
      event.type === TEAM_PI_ACTIVITY_TOOL_EXECUTION_END
    ) {
      let phase: MemberToolActivityPhase = MEMBER_ACTIVITY_TOOL_UPDATE
      if (event.type === TEAM_PI_ACTIVITY_TOOL_EXECUTION_START) {
        phase = MEMBER_ACTIVITY_TOOL_START
      } else if (event.type === TEAM_PI_ACTIVITY_TOOL_EXECUTION_END) {
        phase = MEMBER_ACTIVITY_TOOL_END
      }
      this.listener({
        kind: MEMBER_EXECUTION_ACTIVITY,
        executionId: this.state.executionId,
        phase,
        callId: event.toolCallId,
        name: event.toolName,
      })
    }
  }

  private message(message: AssistantMessage): void {
    for (const content of message.content) {
      if (
        (content.type === TEAM_PI_ACTIVITY_TEXT && content.text.length > 0) ||
        (content.type === TEAM_PI_ACTIVITY_THINKING && content.thinking.length > 0)
      ) {
        this.update()
        break
      }
    }
  }

  private settle(): void {
    if (this.active) {
      this.active = false
      this.emit(MEMBER_ACTIVITY_SETTLED)
    }
  }

  private start(): void {
    if (!this.active) {
      this.active = true
      this.listener({
        kind: MEMBER_EXECUTION_ACTIVITY,
        executionId: this.state.executionId,
        phase: MEMBER_ACTIVITY_STARTED,
      })
    }
  }

  private update(): void {
    if (this.active) {
      this.emit(MEMBER_ACTIVITY_UPDATED)
    }
  }

  private emit(phase: MemberActivityPhase): void {
    this.listener({ kind: MEMBER_EXECUTION_ACTIVITY, executionId: this.state.executionId, phase })
  }
}
