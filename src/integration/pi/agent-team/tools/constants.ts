import { Type } from "typebox"
import {
  TASK_CLAIM,
  TASK_COMPLETE,
  TASK_COMPLETED,
  TASK_DELETE,
  TASK_EDIT,
  TASK_IN_PROGRESS,
  TASK_PENDING,
  TASK_REASSIGN,
  TASK_RELEASE,
  TASK_REOPEN,
  TASK_SET_DEPENDENCIES,
} from "#synapse/modules"

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

export const TEAM_TOOL_SUBAGENT_PARAMETERS = Type.Object({
  task: Type.String({ description: "Tarefa completa do subagente; ele começa sem o histórico desta conversa." }),
  description: Type.String({ description: "Descrição curta do trabalho do subagente, mostrada em list_agents." }),
  name: Type.Optional(
    Type.String({
      minLength: 1,
      description: "Nome do subagente (minúsculas, dígitos e hífen); se omitido, vira agent-1, agent-2...",
    }),
  ),
  model: Type.Optional(
    Type.String({
      minLength: 1,
      description:
        "Modelo do subagente, no formato provider/id mostrado por list_models. Se omitido, o subagente usa o modelo do lead.",
    }),
  ),
  thinking: Type.Optional(
    Type.String({
      minLength: 1,
      description:
        "Nível de raciocínio do subagente, um dos aceitos pelo modelo em list_models. Se omitido, o subagente usa o nível do lead.",
    }),
  ),
})

export const TEAM_TOOL_SEND_MESSAGE_PARAMETERS = Type.Object({
  agent: Type.String({ description: "Nome de outro agente da equipe, como mostrado por list_agents." }),
  message: Type.String({ description: "Mensagem a entregar ao agente." }),
})

export const TEAM_TOOL_INTERRUPT_AGENT_PARAMETERS = Type.Object({
  agent: Type.String({ description: "Nome do subagente a interromper." }),
})

export const TEAM_TOOL_WAIT_AGENT_PARAMETERS = Type.Object({
  timeout_ms: Type.Integer({
    minimum: TEAM_TOOL_MIN_WAIT_MS,
    maximum: TEAM_TOOL_MAX_WAIT_MS,
    description: "Tempo máximo de espera, em milissegundos, de 1000 a 3600000.",
  }),
})

export const TEAM_TOOL_NO_PARAMETERS = Type.Object({})

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

export const TEAM_TOOL_CREATE_TASK_PARAMETERS = Type.Object({
  subject: Type.String({ description: "Título curto da tarefa." }),
  description: Type.String({ description: "Detalhes completos e critérios de aceite da tarefa." }),
  blocked_by: Type.Array(Type.String(), {
    description: "Ids das tarefas que precisam estar concluídas antes desta; [] quando não há nenhuma.",
  }),
  write_scopes: Type.Array(Type.String(), {
    description:
      "Prefixos de arquivo ou pasta, relativos ao projeto, que a tarefa pretende alterar; [] quando não altera arquivos. É um aviso, não uma trava.",
  }),
})

export const TEAM_TOOL_LIST_TASKS_PARAMETERS = Type.Object({
  status: Type.Optional(
    Type.Union([Type.Literal(TASK_PENDING), Type.Literal(TASK_IN_PROGRESS), Type.Literal(TASK_COMPLETED)]),
  ),
  owner: Type.Optional(Type.String({ description: "Filtra pelo nome do agente responsável." })),
  unowned: Type.Optional(
    Type.Boolean({ description: "true lista só tarefas sem responsável; false, só as atribuídas." }),
  ),
  ready: Type.Optional(
    Type.Boolean({ description: "Filtra pelas tarefas prontas para assumir (pendentes e sem bloqueio)." }),
  ),
})

export const TEAM_TOOL_GET_TASK_PARAMETERS = Type.Object({
  task_id: Type.String({ description: "Id da tarefa compartilhada." }),
})

export const TEAM_TOOL_UPDATE_TASK_PARAMETERS = Type.Object({
  task_id: Type.String({ description: "Id da tarefa compartilhada." }),
  expected_revision: Type.Integer({
    description:
      "Revisão atual da tarefa, lida em team_task_get ou team_task_list. A mudança é recusada se a revisão já mudou.",
  }),
  action: Type.Union([
    Type.Literal(TASK_CLAIM),
    Type.Literal(TASK_RELEASE),
    Type.Literal(TASK_EDIT),
    Type.Literal(TASK_SET_DEPENDENCIES),
    Type.Literal(TASK_COMPLETE),
    Type.Literal(TASK_REOPEN),
    Type.Literal(TASK_REASSIGN),
    Type.Literal(TASK_DELETE),
  ]),
  subject: Type.Optional(Type.String({ minLength: 1, description: "Novo título, para edit." })),
  description: Type.Optional(Type.String({ minLength: 1, description: "Novos detalhes, para edit." })),
  blocked_by: Type.Optional(
    Type.Array(Type.String(), { description: "Lista completa de bloqueios, para set_dependencies." }),
  ),
  write_scopes: Type.Optional(Type.Array(Type.String(), { description: "Novos prefixos de escrita, para edit." })),
  owner: Type.Optional(
    Type.String({
      minLength: 1,
      description:
        "Nome do agente que recebe a tarefa em reassign (só o lead reatribui); omita para deixar sem responsável.",
    }),
  ),
})

export const TEAM_TOOL_SUBJECT_FIELD = "subject"

export const TEAM_TOOL_DESCRIPTION_FIELD = "description"

export const TEAM_TOOL_OWNER_FIELD = "owner"
