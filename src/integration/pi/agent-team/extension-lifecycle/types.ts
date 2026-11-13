import { type AgentSession, type SessionShutdownEvent } from "@earendil-works/pi-coding-agent"

export type TeamMemberExtensionSession = Pick<AgentSession, "bindExtensions" | "dispose"> & TeamMemberExtensionRunner

export interface TeamMemberExtensionRunner {
  extensionRunner: TeamMemberShutdownEmitter
}

export interface TeamMemberShutdownEmitter {
  emit(event: SessionShutdownEvent): Promise<void>
}

export interface TeamMemberExtensionLifetime {
  ensureHealthy(): void
  close(): Promise<void>
}
