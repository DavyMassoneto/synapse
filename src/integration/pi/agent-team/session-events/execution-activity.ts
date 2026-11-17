import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type AgentSessionEvent } from "@earendil-works/pi-coding-agent"
import {
  MEMBER_ACTIVITY_SETTLED,
  MEMBER_ACTIVITY_STARTED,
  MEMBER_ACTIVITY_UPDATED,
  MEMBER_EXECUTION_ACTIVITY,
  type MemberActivityPhase,
  type MemberSessionListener,
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
  TEAM_PI_WATCHDOG_OBSERVATIONAL_TOOLS,
} from "./constants"
import { type TeamMemberExecutionState } from "./types"

export class PiMemberExecutionActivity {
  private readonly tools = new Set<string>()
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
        if (this.active && !TEAM_PI_WATCHDOG_OBSERVATIONAL_TOOLS.includes(event.toolName)) {
          this.tools.add(event.toolCallId)
          this.update()
        }
        break
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_UPDATE:
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_END:
        this.toolProgress(event.toolCallId, event.type === TEAM_PI_ACTIVITY_TOOL_EXECUTION_END)
        break
      case TEAM_PI_ACTIVITY_AUTO_RETRY_START:
      case TEAM_PI_ACTIVITY_AUTO_RETRY_END:
      case TEAM_PI_ACTIVITY_COMPACTION_START:
      case TEAM_PI_ACTIVITY_COMPACTION_END:
        this.update()
        break
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
      this.tools.clear()
      this.emit(MEMBER_ACTIVITY_SETTLED)
    }
  }

  private toolProgress(callId: string, ended: boolean): void {
    if (this.tools.has(callId)) {
      this.update()
      if (ended) {
        this.tools.delete(callId)
      }
    }
  }

  private start(): void {
    if (!this.active) {
      this.active = true
      this.tools.clear()
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
