export const TEAM_TOOL_SUBAGENT = "subagent"

export const TEAM_TOOL_SEND_MESSAGE = "send_message"

export const TEAM_TOOL_LIST_AGENTS = "list_agents"

export const TEAM_TOOL_WAIT_AGENT = "wait_agent"

export const TEAM_TOOL_INTERRUPT_AGENT = "interrupt_agent"

export const TEAM_TOOL_LIST_MODELS = "list_models"

export const TEAM_TOOL_TASK_CREATE = "team_task_create"

export const TEAM_TOOL_TASK_LIST = "team_task_list"

export const TEAM_TOOL_TASK_GET = "team_task_get"

export const TEAM_TOOL_TASK_UPDATE = "team_task_update"

export const TEAM_TOOL_TEXT_CONTENT = "text"

export const TEAM_TOOL_MIN_WAIT_MS = 1000

export const TEAM_TOOL_MAX_WAIT_MS = 3_600_000

export const TEAM_TOOL_SUBAGENT_DESCRIPTION =
  "Inicia um subagente em segundo plano com a tarefa dada e retorna na hora com o nome dele, sem esperar o resultado. A resposta final do subagente chega depois como mensagem. O subagente continua disponível para send_message."

export const TEAM_TOOL_SEND_MESSAGE_DESCRIPTION =
  "Envia uma mensagem a um agente da equipe. Um agente trabalhando a recebe no próximo passo; um agente parado inicia um novo turno com ela. Retorna a confirmação de entrega, nunca uma resposta."

export const TEAM_TOOL_LIST_AGENTS_DESCRIPTION =
  "Lista os agentes da equipe: nome, estado do turno (running ou inactive) e descrição. O estado não diz se a tarefa foi concluída."

export const TEAM_TOOL_WAIT_AGENT_DESCRIPTION =
  "Espera chegar entrada para você: mensagem de agente ou aviso de término de subagente. Retorna na hora se já há entrada nova. timedOut false significa que há entrada nova, entregue a você no próximo passo."

export const TEAM_TOOL_LIST_MODELS_DESCRIPTION =
  "Lista os modelos que um subagente pode usar, no formato provider/id, com os níveis de raciocínio que cada um aceita."

export const TEAM_TOOL_INTERRUPT_AGENT_DESCRIPTION =
  "Pede a um subagente que pare o turno atual; retorna sem esperar a parada. O subagente continua disponível para send_message."

export const TEAM_TOOL_TASK_CREATE_DESCRIPTION =
  "Cria uma tarefa pendente e sem responsável no quadro compartilhado da equipe."

export const TEAM_TOOL_TASK_LIST_DESCRIPTION =
  "Lista as tarefas compartilhadas com prontidão, responsável, revisão, bloqueios e avisos de sobreposição de escrita."

export const TEAM_TOOL_TASK_GET_DESCRIPTION =
  "Lê o valor atual completo de uma tarefa compartilhada, antes de alterá-la ou executá-la."

export const TEAM_TOOL_TASK_UPDATE_DESCRIPTION =
  "Aplica uma transição a uma tarefa compartilhada, comparando com a revisão atual lida em team_task_get ou team_task_list."

export const TEAM_TOOL_SUBJECT_FIELD = "subject"

export const TEAM_TOOL_DESCRIPTION_FIELD = "description"

export const TEAM_TOOL_OWNER_FIELD = "owner"

export const TEAM_TOOL_CANCELLED_MESSAGE = "Espera da equipe cancelada."

export const TEAM_TOOL_ABORT_NAME = "AbortError"
