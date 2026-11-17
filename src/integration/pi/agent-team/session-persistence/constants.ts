import { constants } from "node:buffer"

export const TEAM_PI_MEMBER_DIRECTORY = "agent-team-sessions"

export const TEAM_PI_MEMBER_LEGACY_CHECKPOINT = "agent-team-checkpoint"

export const TEAM_PI_MEMBER_CHECKPOINT = "agent-team-member-checkpoint"

export const TEAM_PI_MEMBER_SEED = "Sessão persistente de um membro da equipe. Aguarde a tarefa do lead."

export const TEAM_PI_MEMBER_USER_ROLE = "user"

export const TEAM_PI_MEMBER_CUSTOM_ENTRY = "custom"

export const TEAM_PI_MEMBER_MISSING_SESSION = "Sessão do membro ausente ou vazia: "

export const TEAM_PI_MEMBER_INVALID_SESSION = "Identidade da sessão do membro divergente: "

export const TEAM_PI_MEMBER_INVALID_FILE = "Arquivo da sessão do membro inválido: "

export const TEAM_SESSION_READ_MODE = "r"

export const TEAM_SESSION_READ_CHUNK_BYTES = 65_536

export const TEAM_SESSION_MAX_LINE_CODE_UNITS = constants.MAX_STRING_LENGTH

export const TEAM_SESSION_ENCODING = "utf-8"

export const TEAM_SESSION_NEWLINE = "\n"

export const TEAM_SESSION_LINE_TOO_LARGE = "Linha da sessão excede a capacidade de texto do Node: "

export const TEAM_PI_MEMBER_UNSET_SESSION = "A sessão do membro não possui caminho de arquivo."
