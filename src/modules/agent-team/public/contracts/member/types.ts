import {
  type MEMBER_ASSISTANT_RESPONSE,
  type MEMBER_EXECUTION_SETTLED,
  type MEMBER_EXECUTION_STARTED,
  type MEMBER_TOOL_ENDED,
  type MEMBER_TOOL_STARTED,
  type MEMBER_TURN_STARTED,
} from "./constants"

export interface MemberCheckpoint {
  interrupted: boolean
  pending: string[]
}

export interface MemberJournal {
  load(): MemberCheckpoint
  save(checkpoint: MemberCheckpoint): void
}

export interface MemberRecord {
  leadId: string
  name: string
  description: string
  model: string
  thinking: string
  cwd: string
  sessionId: string
  sessionFile: string
}

export type MemberUnsubscribe = () => void

export type MemberSessionListener = (event: MemberSessionEvent) => void

export interface MemberExecutionStarted {
  kind: typeof MEMBER_EXECUTION_STARTED
}

export interface MemberTurnStarted {
  kind: typeof MEMBER_TURN_STARTED
}

export interface MemberToolStarted {
  kind: typeof MEMBER_TOOL_STARTED
  callId: string
  label: string
}

export interface MemberToolEnded {
  kind: typeof MEMBER_TOOL_ENDED
  callId: string
}

export interface MemberAssistantResponse {
  kind: typeof MEMBER_ASSISTANT_RESPONSE
  model: string
  failure?: string
}

export interface MemberExecutionSettled {
  kind: typeof MEMBER_EXECUTION_SETTLED
  aborted: boolean
  answer?: string
}

export type MemberSessionEvent =
  | MemberExecutionStarted
  | MemberTurnStarted
  | MemberToolStarted
  | MemberToolEnded
  | MemberAssistantResponse
  | MemberExecutionSettled

export interface MemberSession {
  isStreaming(): boolean
  prompt(text: string): Promise<void>
  steer(text: string): Promise<void>
  abort(): Promise<void>
  dispose(): void
  subscribe(listener: MemberSessionListener): MemberUnsubscribe
}

export interface OpenedMember {
  session: MemberSession
  journal: MemberJournal
  record: MemberRecord
  lastModel?: string
}

export interface OpenMemberRequest {
  name: string
  description: string
  model?: string
  thinking?: string
}
