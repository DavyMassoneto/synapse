export type TaskStatus = "pending" | "in_progress" | "completed" | "deleted"

export type TaskAction =
  | "claim"
  | "release"
  | "edit"
  | "set_dependencies"
  | "complete"
  | "reopen"
  | "reassign"
  | "delete"

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
  kind: "accepted"
  task: TaskView
}

export interface TaskRefused {
  kind: "refused"
  message: string
}

export type TaskOutcome = TaskAccepted | TaskRefused

export interface TaskJournal {
  recordTask(task: TaskSnapshot): void
}
