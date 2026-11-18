export const TEAM_TOOL_SUBAGENT = "subagent"

export const TEAM_TOOL_SEND_MESSAGE = "send_message"

export const TEAM_TOOL_LIST_AGENTS = "list_agents"

export const TEAM_TOOL_INTERRUPT_AGENT = "interrupt_agent"

export const TEAM_TOOL_LIST_MODELS = "list_models"

export const TEAM_TOOL_TASK_CREATE = "team_task_create"

export const TEAM_TOOL_TASK_LIST = "team_task_list"

export const TEAM_TOOL_TASK_GET = "team_task_get"

export const TEAM_TOOL_TASK_UPDATE = "team_task_update"

export const TEAM_TOOL_TEXT_CONTENT = "text"

export const TEAM_TOOL_SUBAGENT_DESCRIPTION =
  "Delega uma tarefa existente (task_id e expected_revision) a um novo subagente. Valida revisão, estado e bloqueios; atribui responsável, seleciona a tarefa e registra membro e snapshot atomicamente antes de iniciar. Retorna nome e snapshot. Fim de turno não conclui tarefa. A seleção organiza o trabalho, não autoriza comandos; escopos são avisos, não permissões. A resposta final chega depois como mensagem; o membro continua disponível para send_message."

export const TEAM_TOOL_SEND_MESSAGE_DESCRIPTION =
  "Envia coordenação livre (mode coordination) sem mudar a tarefa selecionada, ou delega trabalho (mode delegation + task_id + expected_revision) a agente existente, inclusive entre membros. Delegação valida revisão, prontidão e responsável, persiste e seleciona antes da entrega; lead pode transferir qualquer responsável, membro só tarefa livre, própria ou do destino. Retorna entrega e snapshot na delegação, nunca resposta. Em curso usa steer nativo; parado inicia turno. Mudanças de tarefa não cancelam execução; fim de turno não conclui tarefa."

export const TEAM_TOOL_LIST_AGENTS_DESCRIPTION =
  "Lista agentes, estado, duração de execução/ferramentas (sem argumentos), timestamp/idade do último sinal observado e última atualização das tarefas separadamente. Sinais de streaming/ferramentas não comprovam progresso real; silêncio prolongado não confirma travamento. Após reload os sinais da nova execução são desconhecidos. Apenas observacional: não bloqueia, interrompe, acorda ou altera tarefas."

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
  "Aplica uma transição com a revisão atual lida em team_task_get ou team_task_list. claim inicia tarefa pendente pronta e seleciona para o caller; resume seleciona tarefa própria já em andamento. reassign só reserva responsável, aceita bloqueios e não muda seleção; só o lead reatribui. Ferramentas e comandos são livres sem tarefa selecionada. Mudanças de tarefa não cancelam execução. complete é explícito."

export const TEAM_TOOL_SUBJECT_FIELD = "subject"

export const TEAM_TOOL_DESCRIPTION_FIELD = "description"

export const TEAM_TOOL_OWNER_FIELD = "owner"

export const TEAM_TOOL_TASK_CLEAN = "team_task_clean"
export const TEAM_TOOL_TASK_CLEAN_DESCRIPTION =
  "Remove do quadro somente tarefas concluídas e preserva dependências satisfeitas. Exclusiva do lead."

export const TEAM_TOOL_MODEL_ONLY = "model-only"
export const TEAM_TOOL_SEQUENTIAL = "sequential"
