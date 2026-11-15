import { TEAM_PI_MEMBER_IDENTITY_PREFIX } from "#synapse/integration/pi/agent-team"
import { SCRIPTED_PROVIDER_TEXT_KIND, type ScriptedProviderStep } from "../scripted-provider"

export const TEAM_DISTRIBUTION_DONE_STEP: ScriptedProviderStep = {
  kind: SCRIPTED_PROVIDER_TEXT_KIND,
  text: "concluído",
}

export const TEAM_DISTRIBUTION_MEMBER_MARKER = TEAM_PI_MEMBER_IDENTITY_PREFIX

export const TEAM_DISTRIBUTION_MEMBER_NAME = "worker"

export const TEAM_DISTRIBUTION_SESSION_FILE = "lead.jsonl"

export const TEAM_DISTRIBUTION_SESSION_DIRECTORY = "sessions"

export const TEAM_DISTRIBUTION_MODULE_FAILURE = "Cannot find module"

export const TEAM_DISTRIBUTION_TASK_DESCRIPTION = "Cenário real"

export const TEAM_DISTRIBUTION_BOARD_PROMPT = "Crie e liste uma tarefa"

export const TEAM_DISTRIBUTION_PERSIST_PROMPT = "Crie membro persistente"

export const TEAM_DISTRIBUTION_CREATE_PROMPT = "Crie um membro"

export const TEAM_DISTRIBUTION_SEND_PROMPT = "Envie mensagem"

export const TEAM_DISTRIBUTION_RESTORE_PROMPT = "Liste os agentes restaurados"

export const TEAM_DISTRIBUTION_MESSAGE = "Olá"

export const TEAM_DISTRIBUTION_TASK = "Responda pronto"

export const TEAM_DISTRIBUTION_DESCRIPTION = "Teste"

export const TEAM_DISTRIBUTION_TASK_SUBJECT = "Verificar equipe"

export const TEAM_DISTRIBUTION_INACTIVE_STATUS = "inactive"

export const TEAM_DISTRIBUTION_MEMBER_REPLY = "membro pronto"

export const TEAM_DISTRIBUTION_UNKNOWN_RECIPIENT = "missing"

export const TEAM_DISTRIBUTION_BOARD_REPLY = "quadro consultado"

export const TEAM_DISTRIBUTION_REFUSED_REPLY = "recusado"

export const TEAM_DISTRIBUTION_RESTORED_REPLY = "restaurado"

export const TEAM_DISTRIBUTION_TOOL_END_EVENT = "tool_execution_end"

export const TEAM_DISTRIBUTION_EMPTY_ARGUMENTS = "{}"

export const TEAM_DISTRIBUTION_PI_SETTINGS = "settings.json"

export const TEAM_DISTRIBUTION_RESPONSE_EVENT = "message_end"

export const TEAM_DISTRIBUTION_REMOVED_WAIT = "wait_agent"
export const TEAM_DISTRIBUTION_REMOVED_WAIT_ERROR = "Tool wait_agent not found"
export const TEAM_DISTRIBUTION_REMOVED_WAIT_TITLE = "wait_agent removido é recusado pelo runtime RPC"
export const TEAM_DISTRIBUTION_REMOVED_WAIT_PROMPT = "Tente a ferramenta removida"
export const TEAM_DISTRIBUTION_REMOVED_WAIT_ARGUMENTS = "{}"
export const TEAM_DISTRIBUTION_REMOVED_WAIT_REPLY = "ferramenta indisponível"
