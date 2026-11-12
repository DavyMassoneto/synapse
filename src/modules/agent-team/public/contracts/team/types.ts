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
import {
  type TEAM_DONE,
  type TEAM_FAILED,
  type TEAM_FINISHED,
  type TEAM_IDLE,
  type TEAM_INACTIVE,
  type TEAM_INTERRUPT_REQUESTED,
  type TEAM_INTERRUPTED,
  type TEAM_MODEL_KNOWN,
  type TEAM_MODEL_UNAVAILABLE,
  type TEAM_REFUSED,
  type TEAM_RUNNING,
  type TEAM_STARTED,
  type TEAM_WAIT_COMPLETED,
  type TEAM_WAITING,
  type TEAM_WORKING,
} from "./constants"

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
  kind: typeof TEAM_MODEL_KNOWN
  model: string
}

export interface TeamUnavailableModelReference {
  kind: typeof TEAM_MODEL_UNAVAILABLE
}

export type TeamModelReference = TeamKnownModelReference | TeamUnavailableModelReference

export type TeamAgentStatus = typeof TEAM_RUNNING | typeof TEAM_INACTIVE

export type TeamAgentState =
  | typeof TEAM_WORKING
  | typeof TEAM_WAITING
  | typeof TEAM_IDLE
  | typeof TEAM_FINISHED
  | typeof TEAM_INTERRUPTED
  | typeof TEAM_FAILED

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
  kind: typeof TEAM_STARTED
  name: string
  model: string
}

export type TeamStartOutcome = TeamStarted | TeamRefused

export interface TeamDone {
  kind: typeof TEAM_DONE
}

export type TeamOutcome = TeamDone | TeamRefused

export interface TeamRefused {
  kind: typeof TEAM_REFUSED
  message: string
}

export interface TeamInterruptRequested {
  kind: typeof TEAM_INTERRUPT_REQUESTED
}

export type TeamInterruptOutcome = TeamInterruptRequested | TeamRefused

export type TeamWaitOutcome = TeamWaitResult | TeamRefused

export interface TeamWaitResult {
  kind: typeof TEAM_WAIT_COMPLETED
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
