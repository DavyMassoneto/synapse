import { type MemberRecord, type OpenedMember, type OpenMemberRequest } from "../member"
import {
  type CreateTaskInput,
  type TaskFilter,
  type TaskJournal,
  type TaskOutcome,
  type TaskSnapshot,
  type TaskView,
  type UpdateTaskInput,
} from "../task"

export interface StartMemberRequest {
  name?: string
  description: string
  task: string
  model?: string
  thinking?: string
}

export interface MemberSessions {
  open(request: OpenMemberRequest, team: AgentTeam): Promise<OpenedMember>
  reopen(record: MemberRecord, team: AgentTeam): Promise<OpenedMember>
}

export interface TeamModelUse {
  model: TeamModelReference
  effectiveModel: TeamModelReference
}

export interface TeamKnownModelReference {
  kind: "known"
  model: string
}

export interface TeamUnavailableModelReference {
  kind: "unavailable"
}

export type TeamModelReference = TeamKnownModelReference | TeamUnavailableModelReference

export type TeamAgentStatus = "running" | "inactive"

export type TeamAgentState = "working" | "waiting" | "idle" | "finished" | "interrupted" | "failed"

export interface TeamAgentRow {
  name: string
  status: TeamAgentStatus
  state: TeamAgentState
  description: string
  activity: string
  model: string
  effectiveModel?: string
}

export interface TeamOverview {
  agents: TeamAgentRow[]
  tasks: TaskView[]
  events: string[]
}

export interface TeamLeadMessages {
  deliver(text: string): void
}

export interface TeamLeadPresentation {
  show(overview: TeamOverview): void
}

export interface TeamLeadState {
  isRunning(): boolean
  modelUse(): TeamModelUse
}

export interface TeamMemberRegistry {
  recordMember(record: MemberRecord): void
}

export interface TeamRestorationDiagnostics {
  reportFailure(name: string, message: string): void
}

export type TeamLead = TeamLeadMessages &
  TeamLeadPresentation &
  TeamLeadState &
  TeamMemberRegistry &
  TeamRestorationDiagnostics &
  TaskJournal

export interface TeamStarted {
  kind: "started"
  name: string
  model: string
}

export type TeamStartOutcome = TeamStarted | TeamRefused | TeamFailed

export interface TeamDone {
  kind: "done"
}

export type TeamOutcome = TeamDone | TeamRefused | TeamFailed

export interface TeamRefused {
  kind: "refused"
  message: string
}

export interface TeamInterruptRequested {
  kind: "interrupt_requested"
}

export type TeamInterruptOutcome = TeamInterruptRequested | TeamRefused | TeamFailed

export type TeamWaitOutcome = TeamWaitResult | TeamRefused | TeamFailed | TeamCancelled

export interface TeamWaitResult {
  kind: "wait_completed"
  timedOut: boolean
}

export type TeamClock = () => string

export interface AgentTeam {
  start(request: StartMemberRequest): Promise<TeamStartOutcome>
  restore(records: MemberRecord[], tasks: TaskSnapshot[]): Promise<void>
  send(sender: string, target: string, message: string): TeamOutcome
  interrupt(target: string): TeamInterruptOutcome
  wait(name: string, timeoutMs: number, signal?: AbortSignal): Promise<TeamWaitOutcome>
  markLeadSeen(): void
  overview(): TeamOverview
  refresh(): void
  createTask(input: CreateTaskInput): TaskOutcome
  getTask(taskId: string): TaskOutcome
  listTasks(filter: TaskFilter): TaskView[]
  updateTask(caller: string, input: UpdateTaskInput): TaskOutcome
  suspend(): Promise<void>
}

export interface TeamFailed {
  kind: "failed"
  message: string
}

export interface TeamCancelled {
  kind: "cancelled"
}
