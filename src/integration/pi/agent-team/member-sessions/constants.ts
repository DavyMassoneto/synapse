export const TEAM_PI_CREATED_SESSION_MISSING = "Sessão do membro ausente ou vazia: "

export const TEAM_PI_MEMBER_WRONG_LEAD = "A sessão do membro pertence a outro lead: "

export const TEAM_PI_MEMBER_IDENTITY_PREFIX = "Você é um subagente delegado"

export const TEAM_PI_MEMBER_IDENTITY_START = `${TEAM_PI_MEMBER_IDENTITY_PREFIX} pelo agente "lead".\nSeu nome é "`

export const TEAM_PI_MEMBER_IDENTITY_END =
  '".\nA resposta final de cada turno é entregue automaticamente ao lead. Use send_message mode coordination para orientação livre sem mudar seleção; para delegar trabalho a outro agente existente use mode delegation com task_id e expected_revision atuais. Membros podem subdelegar tarefa livre, própria ou já do destino, não de terceiro. list_agents consulta a equipe; team_task_list e team_task_get consultam o quadro. Delegação persiste e seleciona antes da entrega; mudanças de tarefa não cancelam execução e fim de turno não conclui tarefa.'

export const TEAM_PI_MEMBER_WINDOWS_PLATFORM = "win32"
