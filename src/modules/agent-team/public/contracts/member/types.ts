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
  failure?: string
  answer?: string
}

export type MemberSessionEvent =
  | MemberExecutionActivity
  | MemberExecutionStarted
  | MemberTurnStarted
  | MemberToolStarted
  | MemberToolEnded
  | MemberAssistantResponse
  | MemberExecutionSettled

export interface MemberSession {
  isStreaming(): boolean
  prompt(text: string, executionId: number): Promise<void>
  steer(text: string): Promise<void>
  abort(): Promise<void>
  dispose(): Promise<void>
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

export type MemberTimerCallback = () => void
export type MemberTimerCancel = () => void
export interface MemberTurnRuntime {
  monotonic(): number
  schedule(callback: MemberTimerCallback, delayMs: number): MemberTimerCancel
}
export type MemberActivityPhase = "started" | "updated" | "settled"
interface MemberExecutionLifecycleActivity {
  kind: "execution_activity"
  executionId: number
  phase: MemberActivityPhase
}
interface MemberToolActivity {
  kind: "execution_activity"
  executionId: number
  phase: MemberToolActivityPhase
  callId: string
  name: string
}
export type MemberExecutionActivity = MemberExecutionLifecycleActivity | MemberToolActivity

export type MemberToolActivityPhase = "tool-start" | "tool-update" | "tool-end"
