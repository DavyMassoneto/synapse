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
  type MemberActivitySource,
  type MemberExecutionActivity,
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
  TEAM_PI_ACTIVITY_TEXT_DELTA,
  TEAM_PI_ACTIVITY_THINKING,
  TEAM_PI_ACTIVITY_THINKING_DELTA,
  TEAM_PI_ACTIVITY_TOOL_EXECUTION_END,
  TEAM_PI_ACTIVITY_TOOL_EXECUTION_START,
  TEAM_PI_ACTIVITY_TOOL_EXECUTION_UPDATE,
  TEAM_PI_MEMBER_ASSISTANT_ROLE,
  TEAM_PI_OBSERVATION_COMPACTION,
  TEAM_PI_OBSERVATION_MESSAGE,
  TEAM_PI_OBSERVATION_RETRY,
  TEAM_PI_OBSERVATION_STREAM,
} from "./constants"
import { memberToolActivityCategory } from "./tool-category"
import { type TeamMemberExecutionState, type TeamMemberMessageUpdate, type TeamMemberToolEvent } from "./types"

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
      case TEAM_PI_ACTIVITY_MESSAGE_END:
        if (event.message.role === TEAM_PI_MEMBER_ASSISTANT_ROLE) {
          this.message(event.message)
        }
        break
      case TEAM_PI_ACTIVITY_MESSAGE_UPDATE:
        this.messageUpdate(event)
        break
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_START:
        this.tool(event, MEMBER_ACTIVITY_TOOL_START)
        break
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_UPDATE:
        this.tool(event, MEMBER_ACTIVITY_TOOL_UPDATE)
        break
      case TEAM_PI_ACTIVITY_TOOL_EXECUTION_END:
        this.tool(event, MEMBER_ACTIVITY_TOOL_END)
        break
      default:
        this.recovery(event)
    }
  }

  private recovery(event: AgentSessionEvent): void {
    switch (event.type) {
      case TEAM_PI_ACTIVITY_AUTO_RETRY_START:
      case TEAM_PI_ACTIVITY_AUTO_RETRY_END:
        this.update(TEAM_PI_OBSERVATION_RETRY)
        break
      case TEAM_PI_ACTIVITY_COMPACTION_START:
      case TEAM_PI_ACTIVITY_COMPACTION_END:
        this.update(TEAM_PI_OBSERVATION_COMPACTION)
        break
    }
  }

  private messageUpdate(event: TeamMemberMessageUpdate): void {
    if (
      (event.assistantMessageEvent.type === TEAM_PI_ACTIVITY_TEXT_DELTA ||
        event.assistantMessageEvent.type === TEAM_PI_ACTIVITY_THINKING_DELTA) &&
      event.assistantMessageEvent.delta.length > 0
    ) {
      this.update(TEAM_PI_OBSERVATION_STREAM)
    }
  }

  private tool(event: TeamMemberToolEvent, phase: MemberToolActivityPhase): void {
    this.listener({
      kind: MEMBER_EXECUTION_ACTIVITY,
      executionId: this.state.executionId,
      phase,
      callId: event.toolCallId,
      category: memberToolActivityCategory(event.toolName),
    })
  }

  private message(message: AssistantMessage): void {
    for (const content of message.content) {
      if (
        (content.type === TEAM_PI_ACTIVITY_TEXT && content.text.length > 0) ||
        (content.type === TEAM_PI_ACTIVITY_THINKING && content.thinking.length > 0)
      ) {
        this.update(TEAM_PI_OBSERVATION_MESSAGE)
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
      this.emit(MEMBER_ACTIVITY_STARTED)
    }
  }

  private update(source: MemberActivitySource): void {
    if (this.active) {
      this.emit(MEMBER_ACTIVITY_UPDATED, source)
    }
  }

  private emit(phase: MemberActivityPhase, source?: MemberActivitySource): void {
    const event: MemberExecutionActivity = {
      kind: MEMBER_EXECUTION_ACTIVITY,
      executionId: this.state.executionId,
      phase,
    }
    if (source) {
      event.source = source
    }
    this.listener(event)
  }
}
