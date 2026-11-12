export const TEAM_PI_SESSION_START = "session_start"

export const TEAM_PI_SESSION_SHUTDOWN = "session_shutdown"

export const TEAM_PI_BEFORE_AGENT_START = "before_agent_start"

export const TEAM_PI_TURN_START = "turn_start"

export const TEAM_PI_MESSAGE_END = "message_end"

export const TEAM_PI_AGENT_SETTLED = "agent_settled"

export const TEAM_PI_NOTICE_TYPE = "agent-team-notice"

export const TEAM_PI_STEER = "steer"

export const TEAM_PI_TUI_MODE = "tui"

export const TEAM_PI_WIDGET_KEY = "agent-team"

export const TEAM_PI_FAILURE_LEVEL = "error"

export const TEAM_PI_NO_SESSION = "A equipe não está vinculada a uma sessão do lead."

export const TEAM_PI_ASSISTANT_ROLE = "assistant"

export const TEAM_PI_THINKING_SEPARATOR = " · raciocínio "

export const TEAM_PI_PROMPT_SECTION = "agent-team"

export const TEAM_PI_TIME_LOCALE = "pt-BR"

export const TEAM_PI_LEAD_INSTRUCTIONS =
  'Você é o agente raiz desta equipe. Seu nome é "lead". subagent inicia um agente em segundo plano. Escolha modelo e raciocínio conforme a tarefa; list_models mostra as opções. O resultado de cada turno chega como mensagem; send_message retoma um membro parado. Antes da resposta final, espere os resultados necessários com wait_agent. Use list_agents para consultar a equipe. Consulte team_task_list e team_task_get antes de assumir ou alterar uma tarefa; informe a revisão atual em team_task_update. Mudanças no quadro não acordam agentes; use send_message. Divida a escrita por escopos disjuntos e registre write_scopes; use blocked_by quando houver ordem entre tarefas.'

export const TEAM_PI_CONTEXT_ATTACHED = "context-attached"

export const TEAM_PI_CONTEXT_DETACHED = "context-detached"
