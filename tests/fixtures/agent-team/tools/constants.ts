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

export const TEAM_FIXTURE_REMOVED_WAIT_NAME = "wait_agent"

export const TEAM_FIXTURE_CLEAN_TOOL = "team_task_clean"
export const TEAM_FIXTURE_CLEAN_EXPOSURE = "model-only"
export const TEAM_FIXTURE_CLEAN_EXECUTION = "sequential"
export const TEAM_FIXTURE_CLEAN_POLICY_TEST = "limpeza exclusiva do lead é model-only e sequencial"

export const TEAM_FIXTURE_TEN_TOOLS_TITLE = "registra as dez ferramentas do lead"
