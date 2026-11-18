export const TEAM_PI_SESSION_START = "session_start"

export const TEAM_PI_SESSION_SHUTDOWN = "session_shutdown"

export const TEAM_PI_BEFORE_AGENT_START = "before_agent_start"

export const TEAM_PI_TURN_START = "turn_start"

export const TEAM_PI_MESSAGE_END = "message_end"

export const TEAM_PI_AGENT_SETTLED = "agent_settled"

export const TEAM_PI_PROMPT_SECTION = "agent-team"

export const TEAM_PI_TIME_LOCALE = "pt-BR"

export const TEAM_PI_LEAD_INSTRUCTIONS =
  'Você é o agente raiz desta equipe. Seu nome é "lead". subagent exige task_id e expected_revision de tarefa existente; valida prontidão e registra membro e atribuição atomicamente antes de iniciar o agente com snapshot vinculado. Escolha modelo e raciocínio conforme a tarefa; list_models mostra as opções. O resultado de cada turno chega como mensagem. send_message mode coordination envia orientação sem mudar seleção; mode delegation exige task_id e expected_revision, valida e seleciona tarefa no destino antes de iniciar ou orientar seu turno, inclusive entre membros. Lead pode transferir qualquer responsável; membro delega tarefa livre, própria ou já do destino. Os resultados chegam automaticamente como mensagens; não faça polling nem force turnos vazios para esperar. Use list_agents para consultar a equipe. Consulte team_task_list e team_task_get antes de assumir ou alterar uma tarefa; informe a revisão atual em team_task_update. Mudanças no quadro não acordam agentes; para executar trabalho use send_message mode delegation com tarefa e revisão. Coordenação não delega trabalho. Mudanças de seleção não cancelam o turno. Divida a escrita por escopos disjuntos e registre write_scopes; use blocked_by quando houver ordem entre tarefas.'
