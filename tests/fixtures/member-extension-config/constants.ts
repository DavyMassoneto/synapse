export const MEMBER_CONFIG_SETTINGS = "settings.json"
export const MEMBER_CONFIG_FILE = "agent-team.json"
export const MEMBER_CONFIG_EXTENSION = "extension.ts"
export const MEMBER_CONFIG_OTHER = "other.ts"
export const MEMBER_CONFIG_TEMP = "member-config-"
export const MEMBER_CONFIG_FACTORY =
  'export default function(pi) { pi.registerCommand("external", { handler: async function() {} }) }'
export const MEMBER_CONFIG_EXCLUDED_FACTORY = 'throw new Error("excluded module imported")'
export const MEMBER_CONFIG_SUITE = "configuração nativa de extensões do membro"
export const MEMBER_CONFIG_RELOAD = "alterar configuração pi desativa extensão inclusive no reload"
export const MEMBER_CONFIG_EXCLUDED = "exclusão impede import e não bloqueia extensão externa habilitada"
export const MEMBER_CONFIG_INVALID = "lista inválida recusa antes de importar"
export const MEMBER_CONFIG_TRUST = "trust do lead controla descoberta do projeto"
export const MEMBER_CONFIG_TEAM_PATH = "../../src/extensions/agent-team.ts"
export const MEMBER_CONFIG_TEAM_EXCLUDED = "agent-team excluído não registra outra equipe"
export const MEMBER_CONFIG_SYMLINK = "caminho canônico exclui alias e recusa reativação explícita"
export const MEMBER_CONFIG_ALIAS = "alias.ts"

export const MEMBER_CONFIG_AGENT_DIRECTORY = "agent"
export const MEMBER_CONFIG_PROJECT_DIRECTORY = "project"
export const MEMBER_CONFIG_PROJECT_SETTINGS_DIRECTORY = ".pi"
export const MEMBER_CONFIG_COMMAND = "external"
export const MEMBER_CONFIG_DISABLE_PREFIX = "-"
export const MEMBER_CONFIG_ENABLE_PREFIX = "+"
export const MEMBER_CONFIG_INVALID_MESSAGE = "Configuração de extensões de membros inválida"

export const MEMBER_CONFIG_EDIT = "recarregar o mesmo caminho executa a versão editada e remove a antiga"
export const MEMBER_CONFIG_FACTORY_EDITED =
  'export default function(pi) { pi.registerCommand("edited", { handler: async function() {} }) }'
export const MEMBER_CONFIG_PACKAGE = "filtro negativo persistido do pacote desativa uma entrada"
export const MEMBER_CONFIG_REOPEN = "nova sessão respeita desativação persistida"
export const MEMBER_CONFIG_SESSION_RELOAD = "session.reload reflete desativação persistida"
export const MEMBER_CONFIG_SESSION_RESTORE = "reabertura respeita desativação persistida com trust falso"
export const MEMBER_CONFIG_LEAD_TRUST = "trust falso do contexto do lead chega à sessão real do membro"

export const MEMBER_CONFIG_AGENT_ENVIRONMENT = "PI_CODING_AGENT_DIR"
export const MEMBER_CONFIG_MODEL_PROVIDER = "fixture"
export const MEMBER_CONFIG_MODEL_ID = "model"
export const MEMBER_CONFIG_CONTEXT_WINDOW = 100000
export const MEMBER_CONFIG_STORAGE = "sessions"
export const MEMBER_CONFIG_NAME = "member"
export const MEMBER_CONFIG_THINKING = "off"
export const MEMBER_CONFIG_MANIFEST = "package.json"
export const MEMBER_CONFIG_PACKAGE_NAME = "fixture-package"
export const MEMBER_CONFIG_EDITED_COMMAND = "edited"
