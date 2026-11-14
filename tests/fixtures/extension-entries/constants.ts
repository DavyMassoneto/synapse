import { type EntryRegistrationExpectation, type EntryVirtualModelExpectation } from "./types"
export const ENTRIES_SUITE = "entradas independentes Synapse"
export const ENTRIES_NONE = "sem entradas herdáveis não há herança automática"
export const ENTRIES_ROUTER = "router carregado é herdado uma vez"
export const ENTRIES_RULES = "regras explícitas e herdadas registram uma vez"
export const ENTRIES_RELOAD = "reload elimina presença antiga"
export const ENTRIES_COOLDOWN = "cooldown independente não ativa router nem regras"
export const ENTRIES_FAILED = "fábrica que falha não deixa presença carregada"
export const ENTRIES_FAILURE = "failed entry"
export const ENTRIES_ROUTER_ABSENT_REQUEST = "membro sem router recusa jev/auto sem provider nem modelo virtual"
export const ENTRIES_UNAVAILABLE_MODEL = /Modelo indisponível/
export const ENTRIES_MEMBER_NAME = "member"
export const ENTRIES_MEMBER_PROVIDER = "provider"
export const ENTRIES_MEMBER_MODEL = "model"
export const ENTRIES_MEMBER_CONTEXT_WINDOW = 100000
export const ENTRIES_MEMBER_VIRTUAL_REFERENCE = "jev/auto"
export const ENTRIES_EXPLICIT = "escolha explícita carrega mesmo sem presença no lead"

export const ENTRIES_RULES_PATH = "../../../src/extensions/response-rules.ts"

export const ENTRIES_PATHS = [
  "../../../src/extensions/advisor.ts",
  "../../../src/extensions/cooldown-retry.ts",
  ENTRIES_RULES_PATH,
  "../../../src/extensions/model-router.ts",
  "../../../src/extensions/agent-team.ts",
  "../../../src/extensions/iphone.ts",
  "../../../src/extensions/computer-use.ts",
]
export const ENTRIES_REAL_PATHS = "sete caminhos registram capacidades próprias uma vez"
export const ENTRIES_REAL_DEDUPE = "caminho explícito antes da fábrica herdada registra regras uma vez"
export const ENTRIES_REAL_ABSENT = "desativar entrada remove somente seus registros"

export const ENTRIES_REGISTRATIONS: EntryRegistrationExpectation[] = [
  {
    tools: ["advisor"],
    commands: ["advisor"],
    events: ["session_start", "session_shutdown", "before_agent_start", "turn_end"],
    eventCounts: [3, 1, 1, 1],
  },
  { tools: [], commands: [], events: ["message_end"], eventCounts: [1] },
  { tools: [], commands: [], events: ["context"], eventCounts: [1] },
  { tools: [], commands: [], events: [], eventCounts: [] },
  {
    tools: [
      "subagent",
      "interrupt_agent",
      "list_models",
      "send_message",
      "list_agents",
      "wait_agent",
      "team_task_create",
      "team_task_update",
      "team_task_get",
      "team_task_list",
    ],
    commands: [],
    events: ["session_start", "session_shutdown", "before_agent_start", "turn_start", "message_end", "agent_settled"],
    eventCounts: [1, 1, 1, 1, 1, 1],
  },
  { tools: ["iphone"], commands: ["iphone"], events: ["session_shutdown"], eventCounts: [1] },
  { tools: ["computer_use"], commands: ["computer-use"], events: ["session_shutdown"], eventCounts: [1] },
]
export const ENTRIES_VIRTUAL_MODEL: EntryVirtualModelExpectation = { provider: "jev", id: "auto" }
