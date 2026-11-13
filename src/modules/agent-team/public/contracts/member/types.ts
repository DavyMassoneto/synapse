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
  kind: "execution_started"
}

export interface MemberTurnStarted {
  kind: "turn_started"
}

export interface MemberToolStarted {
  kind: "tool_started"
  callId: string
  label: string
}

export interface MemberToolEnded {
  kind: "tool_ended"
  callId: string
}

export interface MemberAssistantResponse {
  kind: "assistant_response"
  model: string
  failure?: string
}

export interface MemberExecutionSettled {
  kind: "execution_settled"
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
