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

export const TEAM_FIXTURE_TOOL_POLICIES = [
  { name: "team_task_clean", executionMode: "sequential" },
  { name: "subagent", executionMode: "sequential" },
  { name: "send_message", executionMode: "sequential" },
  { name: "team_task_create", executionMode: "sequential" },
  { name: "team_task_update", executionMode: "sequential" },
]

export const TEAM_FIXTURE_QUERY_TOOL_NAMES = [
  "interrupt_agent",
  "list_models",
  "list_agents",
  "team_task_get",
  "team_task_list",
]

export const TEAM_FIXTURE_ACCESS_SUITE = "exposição administrativa da equipe"
export const TEAM_FIXTURE_EXPOSURE_TEST = "todas as dez ferramentas são exclusivas do modelo"
export const TEAM_FIXTURE_SEQUENTIAL_TEST = "mutações previstas executam sequencialmente"
export const TEAM_FIXTURE_QUERY_TEST = "interrupção e consultas mantêm execução padrão"
export const TEAM_FIXTURE_NESTED_TEST = "SDK recusa chamadas administrativas feitas por outra ferramenta"
export const TEAM_FIXTURE_DIRECT_TEST = "SDK continua aceitando chamada direta do modelo"
export const TEAM_FIXTURE_NESTED_TOOL = "nested_probe"
export const TEAM_FIXTURE_ACCESS_PROMPT = "exercise tool access"
export const TEAM_FIXTURE_ACCESS_PROVIDER = "anthropic"
export const TEAM_FIXTURE_ACCESS_MODEL = "access-model"
export const TEAM_FIXTURE_ACCESS_CONTEXT_WINDOW = 32000
export const TEAM_FIXTURE_ACCESS_CALL_ID = "access-call"
export const TEAM_FIXTURE_ACCESS_DONE = "done"
export const TEAM_FIXTURE_ACCESS_FAILURE = /Tool \w+ not found/
export const TEAM_FIXTURE_ACCESS_LIST = "list_agents"
export const TEAM_FIXTURE_ACCESS_DIRECTORY = "team-access-"
export const TEAM_FIXTURE_ACCESS_API_KEY = "fixture-not-a-real-key"
export const TEAM_FIXTURE_ACCESS_MODEL_ONLY = "model-only"
export const TEAM_FIXTURE_ACCESS_TEXT = "text"
export const TEAM_FIXTURE_ACCESS_TOOL_CALL = "toolCall"
export const TEAM_FIXTURE_ACCESS_ASSISTANT = "assistant"
export const TEAM_FIXTURE_ACCESS_TOOL_USE = "toolUse"
export const TEAM_FIXTURE_ACCESS_STOP = "stop"
export const TEAM_FIXTURE_ACCESS_START_EVENT = "start"
export const TEAM_FIXTURE_ACCESS_DONE_EVENT = "done"
