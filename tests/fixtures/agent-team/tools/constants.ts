import { type TaskRefused, type TaskView } from "#synapse/modules/agent-team"

export const TEAM_FIXTURE_REFUSAL: TaskRefused = { kind: "refused", message: "Operação recusada." }

export const TEAM_FIXTURE_TASK: TaskView = {
  id: "task-1",
  revision: 1,
  subject: "Tarefa",
  description: "Descrição",
  status: "pending",
  blockedBy: [],
  writeScopes: [],
  ready: true,
  writeScopeWarnings: [],
}

export const TEAM_FIXTURE_NINE_TOOLS_TITLE = "registra as nove ferramentas do lead"
export const TEAM_FIXTURE_REMOVED_WAIT_NAME = "wait_agent"
