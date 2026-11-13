import { type AgentSessionEvent, type AgentSessionEventListener } from "@earendil-works/pi-coding-agent"
import { type TeamMemberSessionPort } from "#synapse/integration"
import { type MemberSessionEvent, type MemberUnsubscribe } from "#synapse/modules"
import {
  TEAM_EXTENSION_FIXTURE_FAILURE,
  TEAM_SESSION_FIXTURE_QUEUED,
  TEAM_SESSION_FIXTURE_REPLY_TEXT,
} from "./constants"

export class TeamSessionDouble implements TeamMemberSessionPort {
  isStreaming = false

  readonly events: MemberSessionEvent[] = []

  readonly prompts: string[] = []

  readonly steered: string[] = []

  aborted = false

  disposed = false

  extensionFailure = false

  private listener?: AgentSessionEventListener

  getLastAssistantText(): string {
    return TEAM_SESSION_FIXTURE_REPLY_TEXT
  }

  subscribe(listener: AgentSessionEventListener): MemberUnsubscribe {
    this.listener = listener
    return this.unsubscribe.bind(this)
  }

  emit(event: AgentSessionEvent): void {
    this.listener?.(event)
  }

  collect(event: MemberSessionEvent): void {
    this.events.push(event)
  }

  async prompt(text: string): Promise<void> {
    this.prompts.push(text)
  }

  async steer(text: string): Promise<"queued"> {
    this.steered.push(text)
    return TEAM_SESSION_FIXTURE_QUEUED
  }

  async abort(): Promise<void> {
    this.aborted = true
  }

  async dispose(): Promise<void> {
    this.disposed = true
  }

  private unsubscribe(): void {
    delete this.listener
  }

  ensureHealthy(): void {
    if (this.extensionFailure) {
      throw new Error(TEAM_EXTENSION_FIXTURE_FAILURE)
    }
    if (this.disposed) {
      throw new Error("Sessão já descartada")
    }
  }

  async close(): Promise<void> {
    await this.dispose()
  }
}
