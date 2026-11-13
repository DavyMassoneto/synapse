import { type MemberRecord } from "#synapse/modules"

export const TEAM_SESSION_FIXTURE_TEST_PREFIX = "synapse-team-session-"

export const TEAM_SESSION_FIXTURE_TEST_CWD = "workspace"

export const TEAM_SESSION_FIXTURE_TEST_LEAD = "lead-session"

export const TEAM_SESSION_FIXTURE_TEST_MEMBER = "worker"

export const TEAM_SESSION_FIXTURE_TEST_RECORD: MemberRecord = {
  leadId: TEAM_SESSION_FIXTURE_TEST_LEAD,
  name: TEAM_SESSION_FIXTURE_TEST_MEMBER,
  description: "Implementação de teste",
  model: "provider/model",
  thinking: "low",
  cwd: TEAM_SESSION_FIXTURE_TEST_CWD,
  sessionId: "session-id",
  sessionFile: "session-file",
}

export const TEAM_SESSION_FIXTURE_TEST_CHECKPOINT = { interrupted: true, pending: ["mensagem não confirmada"] }

export const TEAM_SESSION_FIXTURE_RPC_MODE = "rpc"

export const TEAM_SESSION_FIXTURE_THINKING_LEVEL = "low"

export const TEAM_SESSION_FIXTURE_REPLY_TEXT = "resposta"

export const TEAM_SESSION_FIXTURE_QUEUED = "queued"

export const TEAM_SESSION_FIXTURE_STORAGE_MISSING = "Arquivo da sessão de teste ausente."

export const TEAM_EXTENSION_FIXTURE_START = "start"

export const TEAM_EXTENSION_FIXTURE_SHUTDOWN = "shutdown"

export const TEAM_EXTENSION_FIXTURE_DISPOSE = "dispose"

export const TEAM_EXTENSION_FIXTURE_PATH = "fake-extension"

export const TEAM_EXTENSION_FIXTURE_EVENT = "session_start"

export const TEAM_EXTENSION_FIXTURE_FAILURE = "Falha da extensão falsa"

export const TEAM_SESSION_FIXTURE_HEADER_TYPE = "session"

export const TEAM_SESSION_FIXTURE_LEGACY_VERSION = 1

export const TEAM_SESSION_FIXTURE_TIMESTAMP = "2026-01-01T00:00:00.000Z"

export const TEAM_SESSION_FIXTURE_WRONG_ID = "wrong-session"

export const TEAM_EXTENSION_FIXTURE_UNAVAILABLE_MODEL = "Modelo solicitado indisponível"

export const TEAM_EXTENSION_FIXTURE_START_EXPECTED_FAILURE = "Startup deveria falhar"

export const TEAM_EXTENSION_FIXTURE_FALLBACK_TEST = "fallback de modelo é recusado e limpo uma vez"

export const TEAM_EXTENSION_FIXTURE_BIND_FAILURE_TEST = "falha direta de bind limpa uma vez"

export const TEAM_EXTENSION_FIXTURE_AGGREGATE_TEST = "startup e cleanup preservam os dois erros sem aninhar"

export const TEAM_SESSION_FIXTURE_MESSAGE_TYPE = "message"

export const TEAM_SESSION_FIXTURE_INTERIOR_WHITESPACE = "\n\n  \n"

export const TEAM_SESSION_FIXTURE_BLANK_LINES = "\n\n"

export const TEAM_SESSION_FIXTURE_FINAL_WHITESPACE = "\n\n \t"

export const TEAM_SESSION_FIXTURE_NEWLINE = "\n"

export const TEAM_SESSION_FIXTURE_MALFORMED_ENTRY = "\n{broken\n"

export const TEAM_SESSION_FIXTURE_OTHER_ID = "outra"

export const TEAM_SESSION_FIXTURE_INVALID_PATTERN = /inválido/

export const TEAM_SESSION_FIXTURE_DIVERGENT_PATTERN = /divergente/

export const TEAM_SESSION_FIXTURE_INTERIOR_WHITESPACE_TEST = "recusa linha só de espaços antes de outra linha"

export const TEAM_SESSION_FIXTURE_BLANK_LINES_TEST = "aceita linhas vazias e espaços finais"

export const TEAM_SESSION_FIXTURE_MALFORMED_TEST = "recusa entrada malformada"

export const TEAM_SESSION_FIXTURE_IDENTITY_TEST = "recusa identidade divergente"

export const TEAM_SESSION_FIXTURE_VALIDATION_SUITE = "validação do arquivo de sessão"

export const TEAM_SESSION_FIXTURE_PROVIDER = "provider"

export const TEAM_SESSION_FIXTURE_MODEL = "model"

export const TEAM_SESSION_FIXTURE_CONTEXT_WINDOW = 128000

export const TEAM_SESSION_FIXTURE_LEGACY_FILE = "legacy-session.jsonl"

export const TEAM_SESSION_FIXTURE_LEGACY_BYTES = "invalid legacy bytes"

export const TEAM_SESSION_FIXTURE_OTHER_LEAD = "another-lead"

export const TEAM_SESSION_FIXTURE_INVALID_MODEL = "invalid"

export const TEAM_SESSION_FIXTURE_OTHER_WORKSPACE = "another-workspace"

export const TEAM_SESSION_FIXTURE_OTHER_LEAD_PATTERN = /outro lead/

export const TEAM_SESSION_FIXTURE_ENCODING = "utf8"

export const TEAM_SESSION_FIXTURE_OTHER_LEAD_TEST = "outro lead recusa antes de ler ou alterar sessão legada"

export const TEAM_SESSION_FIXTURE_OTHER_CWD_TEST = "outro cwd recusa antes de ler ou alterar sessão legada"

export const TEAM_SESSION_FIXTURE_MEMBERSHIP_SUITE = "pertencimento da sessão restaurada"

export const TEAM_SESSION_FIXTURE_ZERO_WIDTH_END = "\n\u200b"

export const TEAM_SESSION_FIXTURE_ZERO_WIDTH_TEST = "recusa U200B como espaço final"
