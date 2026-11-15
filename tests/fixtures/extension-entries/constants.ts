import { type EntryRegistrationExpectation, type EntryVirtualModelExpectation } from "./types"
export const ENTRIES_SUITE = "entradas independentes Synapse"
export const ENTRIES_SDK_IMPORT_TIMEOUT_MS = 15000

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

export const ENTRIES_TOOL_COUNTS = [1, 0, 0, 0, 9, 1, 1]
