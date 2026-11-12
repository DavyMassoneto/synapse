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
