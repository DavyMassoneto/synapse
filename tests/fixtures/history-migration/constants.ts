import { fileURLToPath } from "node:url"
import { type TaskSnapshot } from "#synapse/modules/agent-team"
import {
  SCRIPTED_PROVIDER_PROVIDER_URL,
  SCRIPTED_PROVIDER_TEXT_KIND,
  SCRIPTED_PROVIDER_TOOL_CALL_KIND,
  type ScriptedProviderStep,
} from "../scripted-provider"

import { type HistoryMigrationSettings, type HistoryMigrationTeamConfiguration } from "./types"

export const HISTORY_MIGRATION_SETTINGS: HistoryMigrationSettings = {
  extensions: [fileURLToPath(SCRIPTED_PROVIDER_PROVIDER_URL)],
  enableAnalytics: false,
  enableInstallTelemetry: false,
}

export const HISTORY_MIGRATION_TEAM_CONFIGURATION: HistoryMigrationTeamConfiguration = {
  excludedMemberExtensions: [],
}

export const HISTORY_MIGRATION_ENTRYPOINT = new URL("../../../src/extensions/agent-team.ts", import.meta.url)
export const HISTORY_MIGRATION_ALPHA = "alpha"
export const HISTORY_MIGRATION_BETA = "beta"
export const HISTORY_MIGRATION_LEGACY = "legacy"
export const HISTORY_MIGRATION_CONFIRMED = "confirmed"
export const HISTORY_MIGRATION_SECOND_TASK_ID = "task-8"
export const HISTORY_MIGRATION_THIRD_TASK_ID = "task-9"
export const HISTORY_MIGRATION_DISCARDED_DESCRIPTION = "discarded-branch"
export const HISTORY_MIGRATION_MARKER = "fictitious-marker"
export const HISTORY_MIGRATION_IN_PROGRESS = "in_progress"
export const HISTORY_MIGRATION_COMPLETED = "completed"
export const HISTORY_MIGRATION_TASK_PENDING = "pending"
export const HISTORY_MIGRATION_INACTIVE = "inactive"
export const HISTORY_MIGRATION_INTERRUPTED = "interrupted"
export const HISTORY_MIGRATION_IDLE = "idle"
export const HISTORY_MIGRATION_FAILED = "failed"
export const HISTORY_MIGRATION_EXTENSION_ERROR = "extension_error"
export const HISTORY_MIGRATION_WRONG_SESSION_ID = "different-fictional-session"
export const HISTORY_MIGRATION_IDENTITY_DIAGNOSTIC = "divergente"
export const HISTORY_MIGRATION_ONE_PENDING_ACTIVITY = "1"
export const HISTORY_MIGRATION_TWO_PENDING_ACTIVITY = "2"
export const HISTORY_MIGRATION_CONFIRMED_ACTIVITY = ""
export const HISTORY_MIGRATION_SEED_TIMESTAMP_MS = 0
export const HISTORY_MIGRATION_CREATE_DIRECTORY_METHOD = "mkdtempSync"
export const HISTORY_MIGRATION_WRITE_METHOD = "writeFileSync"
export const HISTORY_MIGRATION_REMOVE_METHOD = "rmSync"
export const HISTORY_MIGRATION_INITIALIZE_METHOD = "initialize"
export const HISTORY_MIGRATION_DISPOSE_METHOD = "dispose"
export const HISTORY_MIGRATION_ACQUISITION_PRIMARY = new Error("Falha fictícia de aquisição.")
export const HISTORY_MIGRATION_ACQUISITION_CLEANUP = new Error("Falha fictícia de limpeza.")
export const HISTORY_MIGRATION_HOME_FAILURE_TEST = "falha na criação do HOME remove os recursos já adquiridos"
export const HISTORY_MIGRATION_HOME_CLEANUP_FAILURE_TEST =
  "falha na criação do HOME preserva erro primário e falha de limpeza"
export const HISTORY_MIGRATION_SETUP_FAILURE_TEST = "falha antes de inicializar cenário remove o HOME adquirido"
export const HISTORY_MIGRATION_SETUP_CLEANUP_FAILURE_TEST =
  "falha de inicialização e cleanup preserva ambos erros e remove o HOME"
export const HISTORY_MIGRATION_ACQUISITION_SUITE = "aquisição protegida do histórico fictício"
export const HISTORY_MIGRATION_CLEANUP_FAILURE = "Falha ao preparar e limpar o histórico fictício."
export const HISTORY_MIGRATION_FOREIGN_LEAD = "foreign-lead"
export const HISTORY_MIGRATION_SEED = "Histórico fictício para verificar restauração."
export const HISTORY_MIGRATION_PROMPT = "Consulte os membros e o quadro restaurados."
export const HISTORY_MIGRATION_SESSION_MISSING = "Arquivo fictício ausente."
export const HISTORY_MIGRATION_ENCODING = "utf8"
export const HISTORY_MIGRATION_TASK: TaskSnapshot = {
  id: "task-7",
  revision: 1,
  subject: "Revisar contrato fictício",
  description: "Preservar o snapshot efetivo",
  status: "pending",
  blockedBy: [],
  writeScopes: [],
}
export const HISTORY_MIGRATION_STEPS: ScriptedProviderStep[] = [
  { kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND, name: "list_agents", argumentsJson: "{}" },
  { kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND, name: "team_task_list", argumentsJson: "{}" },
  { kind: SCRIPTED_PROVIDER_TEXT_KIND, text: "Histórico consultado." },
]
export const HISTORY_MIGRATION_MESSAGE_ENTRY = "message"
export const HISTORY_MIGRATION_CUSTOM_ENTRY = "custom"
export const HISTORY_MIGRATION_LIST_AGENTS = "list_agents"
export const HISTORY_MIGRATION_LIST_TASKS = "team_task_list"
export const HISTORY_MIGRATION_USER_ROLE = "user"
export const HISTORY_MIGRATION_TOOL_RESULT_ROLE = "toolResult"
export const HISTORY_MIGRATION_TEXT_KIND = "text"
export const HISTORY_MIGRATION_PROMPT_COMMAND = "prompt"
export const HISTORY_MIGRATION_SETTINGS_FILE = "settings.json"
export const HISTORY_MIGRATION_CONFIG_FILE = "agent-team.json"
export const HISTORY_MIGRATION_MEMBER_DESCRIPTION = "Membro fictício"
export const HISTORY_MIGRATION_THINKING = "off"
export const HISTORY_MIGRATION_CATALOG_DESCRIPTION = "Catálogo atual efetivo"
export const HISTORY_MIGRATION_ADMISSION_DESCRIPTION = "Admissão legada efetiva"
export const HISTORY_MIGRATION_FOREIGN_NAME = "foreign-worker"
export const HISTORY_MIGRATION_PENDING = "Trabalho fictício ainda não confirmado"
export const HISTORY_MIGRATION_CURRENT_PENDING = "Outra pendência fictícia"
export const HISTORY_MIGRATION_CHECKPOINT_TEST = "checkpoint atual e legado respeitam a última entrada do ramo"
export const HISTORY_MIGRATION_ADMISSION_TEST =
  "extensão restaura admission e catálogo misturados com quadro do ramo ativo"
export const HISTORY_MIGRATION_NO_CHECKPOINT_TEST =
  "sessão sem checkpoint continua interrompida, diferente de confirmação explícita"
export const HISTORY_MIGRATION_INVALID_ADMISSION_TEST =
  "admission inválido recusa restauração sem retroceder ao catálogo anterior"
export const HISTORY_MIGRATION_INVALID_CHECKPOINT_TEST = "checkpoint inválido não retrocede à confirmação antiga"
export const HISTORY_MIGRATION_WRONG_IDENTITY_TEST = "identidade divergente recusa membro sem modificar seu arquivo"
export const HISTORY_MIGRATION_SUITE = "migração do histórico com runtime real"
