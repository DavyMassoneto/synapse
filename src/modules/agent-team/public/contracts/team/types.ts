import { type MemberActivitySource, type MemberRecord, type OpenedMember, type OpenMemberRequest } from "../member"
import {
  type CreateTaskInput,
  type TaskCleanOutcome,
  type TaskFilter,
  type TaskJournal,
  type TaskOutcome,
  type TaskSelection,
  type TaskSnapshot,
  type TaskView,
  type UpdateTaskInput,
} from "../task"

export interface StartMemberRequest {
  name?: string
  description: string
  taskId: string
  expectedRevision: number
  model?: string
  thinking?: string
}

export interface MemberSessions {
  discardPrepared(record: MemberRecord): void
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

export type TeamAgentState = "working" | "idle" | "finished" | "interrupted" | "failed"

export interface TeamToolObservation {
  name: string
  elapsedMs: number
}

export type TeamObservedSignal =
  | MemberActivitySource
  | "start"
  | "settled"
  | "turn"
  | "tool-start"
  | "tool-update"
  | "tool-end"

export interface TeamKnownProgress {
  kind: "observed"
  executionId: number
  startedAt: string
  elapsedMs: number
  lastSignalAt: string
  silentMs: number
  lastSignal: TeamObservedSignal
  turns: number
  completedTools: number
  streamUpdates: number
  tools: TeamToolObservation[]
}

export interface TeamUnknownProgress {
  kind: "unknown"
}

export type TeamProgress = TeamKnownProgress | TeamUnknownProgress

export interface TeamTaskObservation {
  id: string
  revision: number
  bound: boolean
  updatedAt?: string
  ageMs?: number
}

export interface TeamAgentRow {
  name: string
  status: TeamAgentStatus
  state: TeamAgentState
  description: string
  activity: string
  model: string
  effectiveModel?: string
  progress?: TeamProgress
  tasks?: TeamTaskObservation[]
  restorationFailed?: boolean
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
  recordAdmission(record: MemberRecord, task: TaskSnapshot): void
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
  task: TaskView
}

export type TeamStartOutcome = TeamStarted | TeamRefused | TeamFailed

export interface TeamDone {
  kind: "done"
}

export type TeamOutcome = TeamDone | TeamRefused | TeamFailed

export interface TeamDelegated {
  kind: "delegated"
  task: TaskView
}

export type TeamDelegationOutcome = TeamDelegated | TeamRefused | TeamFailed

export interface TeamRefused {
  kind: "refused"
  message: string
}

export interface TeamInterruptRequested {
  kind: "interrupt_requested"
}

export type TeamInterruptOutcome = TeamInterruptRequested | TeamRefused | TeamFailed

export type TeamClock = () => string

export interface AgentTeam {
  cleanTasks(caller: string): TaskCleanOutcome
  start(request: StartMemberRequest): Promise<TeamStartOutcome>
  restore(records: MemberRecord[], tasks: TaskSnapshot[]): Promise<void>
  send(sender: string, target: string, message: string): TeamOutcome
  delegate(
    sender: string,
    target: string,
    message: string,
    taskId: string,
    expectedRevision: number,
  ): TeamDelegationOutcome
  interrupt(target: string): TeamInterruptOutcome
  overview(): TeamOverview
  refresh(): void
  createTask(input: CreateTaskInput): TaskOutcome
  selectedTask(caller: string): TaskSelection
  getTask(taskId: string): TaskOutcome
  listTasks(filter: TaskFilter): TaskView[]
  updateTask(caller: string, input: UpdateTaskInput): TaskOutcome
  suspend(): Promise<void>
}

export interface TeamFailed {
  kind: "failed"
  message: string
}
