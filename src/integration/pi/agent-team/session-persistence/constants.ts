import { Type } from "typebox"

export const TEAM_PI_MEMBER_DIRECTORY = "agent-team-sessions"

export const TEAM_PI_MEMBER_CHECKPOINT = "agent-team-member-checkpoint"

export const TEAM_PI_MEMBER_SEED = "Sessão persistente de um membro da equipe. Aguarde a tarefa do lead."

export const TEAM_PI_MEMBER_USER_ROLE = "user"

export const TEAM_PI_MEMBER_CUSTOM_ENTRY = "custom"

export const TEAM_PI_MEMBER_MISSING_SESSION = "Sessão do membro ausente ou vazia: "

export const TEAM_PI_MEMBER_INVALID_SESSION = "Identidade da sessão do membro divergente: "

export const TEAM_PI_MEMBER_INVALID_FILE = "Arquivo da sessão do membro inválido: "

export const TEAM_PI_MEMBER_MAX_SESSION_BYTES = 33_554_432

export const TEAM_PI_MEMBER_SESSION_TOO_LARGE = "Arquivo de sessão excede o limite de leitura: "

export const TEAM_PI_MEMBER_ENCODING = "utf8"

export const TEAM_PI_MEMBER_NEWLINE = "\n"

export const TEAM_PI_MEMBER_HEADER_SCHEMA = Type.Object({
  type: Type.Literal("session"),
  id: Type.String({ minLength: 1 }),
  cwd: Type.String({ minLength: 1 }),
})

export const TEAM_PI_MEMBER_ENTRY_SCHEMA = Type.Object({ type: Type.String({ minLength: 1 }) })

export const TEAM_PI_MEMBER_CHECKPOINT_SCHEMA = Type.Object({
  interrupted: Type.Boolean(),
  pending: Type.Array(Type.String()),
})

export const TEAM_PI_MEMBER_UNSET_SESSION = "A sessão do membro não possui caminho de arquivo."
