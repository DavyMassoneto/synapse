import {
  type TASK_ACCEPTED,
  type TASK_CLAIM,
  type TASK_COMPLETE,
  type TASK_COMPLETED,
  type TASK_DELETE,
  type TASK_DELETED,
  type TASK_EDIT,
  type TASK_IN_PROGRESS,
  type TASK_PENDING,
  type TASK_REASSIGN,
  type TASK_REFUSED,
  type TASK_RELEASE,
  type TASK_REOPEN,
  type TASK_SET_DEPENDENCIES,
} from "./constants"

export type TaskStatus = typeof TASK_PENDING | typeof TASK_IN_PROGRESS | typeof TASK_COMPLETED | typeof TASK_DELETED

export type TaskAction =
  | typeof TASK_CLAIM
  | typeof TASK_RELEASE
  | typeof TASK_EDIT
  | typeof TASK_SET_DEPENDENCIES
  | typeof TASK_COMPLETE
  | typeof TASK_REOPEN
  | typeof TASK_REASSIGN
  | typeof TASK_DELETE

export interface TaskSnapshot {
  id: string
  revision: number
  subject: string
  description: string
  status: TaskStatus
  owner?: string
  blockedBy: string[]
  writeScopes: string[]
}

export interface TaskView extends TaskSnapshot {
  ready: boolean
  writeScopeWarnings: string[]
}

export interface CreateTaskInput {
  subject: string
  description: string
  blockedBy: string[]
  writeScopes: string[]
}

export interface UpdateTaskInput {
  taskId: string
  expectedRevision: number
  action: TaskAction
  subject?: string
  description?: string
  blockedBy?: string[]
  writeScopes?: string[]
  owner?: string
}

export interface TaskFilter {
  status?: TaskStatus
  owner?: string
  unowned?: boolean
  ready?: boolean
}

export interface TaskAccepted {
  kind: typeof TASK_ACCEPTED
  task: TaskView
}

export interface TaskRefused {
  kind: typeof TASK_REFUSED
  message: string
}

export type TaskOutcome = TaskAccepted | TaskRefused

export interface TaskJournal {
  recordTask(task: TaskSnapshot): void
}
