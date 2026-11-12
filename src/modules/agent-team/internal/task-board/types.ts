import {
  type TaskSnapshot,
  type TaskStatus,
  type TaskView,
  type UpdateTaskInput,
} from "#synapse/modules/agent-team/public/contracts"

export interface TaskTransition {
  current: TaskSnapshot
  tasks: TaskSnapshot[]
  input: UpdateTaskInput
  caller: string
  directory: TeamDirectory
}

export type TaskBoardAction = () => TaskView

export type TaskBoardSnapshotIndex = Map<string, TaskSnapshot>

export type TaskBoardRestorePositions = Map<string, TaskBoardRestoreSlot>

export type TaskBoardStatusIndex = Map<string, TaskStatus>

export interface TaskBoardViewContext {
  statuses: TaskBoardStatusIndex
  running: TaskSnapshot[]
}

export interface TeamDirectory {
  isLead(name: string): boolean

  hasAgent(name: string): boolean
}

export interface TaskBoardRestoreSlot {
  index: number
}
