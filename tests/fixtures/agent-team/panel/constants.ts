import { type TaskView, type TeamAgentRow, type TeamOverview } from "#synapse/modules"

export const TEAM_PANEL_TEST_AGENT: TeamAgentRow = {
  name: "lead",
  status: "inactive",
  state: "idle",
  description: "coordena",
  activity: "",
  model: "provedor/modelo · raciocínio high",
  effectiveModel: "",
}

export const TEAM_PANEL_TEST_TASK: TaskView = {
  id: "1",
  revision: 1,
  subject: "tarefa",
  description: "detalhes",
  status: "pending",
  blockedBy: [],
  writeScopes: [],
  ready: true,
  writeScopeWarnings: [],
}

export const TEAM_PANEL_TEST_EMPTY: TeamOverview = { agents: [TEAM_PANEL_TEST_AGENT], tasks: [], events: [] }
