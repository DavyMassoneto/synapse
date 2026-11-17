export const STREAM_SESSION_PREFIX = "synapse-stream-session-"
export const STREAM_SESSION_FILE = "fixture.jsonl"
export const STREAM_SESSION_ID = "stream-fixture"
export const STREAM_SESSION_TIMESTAMP = "2026-01-01T00:00:00.000Z"
export const STREAM_SESSION_BYTES = 36 * 1024 * 1024
export const STREAM_SESSION_PAYLOAD = "texto sintético 漢字🙂 ".repeat(2_000)
export const STREAM_SESSION_ROOT = "root"
export const STREAM_SESSION_ACTIVE_CHECKPOINT = "active-checkpoint"
export const STREAM_SESSION_LEAF = "active-leaf"
export const STREAM_SESSION_ACTIVE_STATE = { interrupted: true, pending: ["pendência ativa"] }
export const STREAM_SESSION_ABANDONED_STATE = { interrupted: false, pending: ["ramo abandonado"] }
export const STREAM_SESSION_HEADER_TYPE = "session"
export const STREAM_SESSION_CUSTOM_TYPE = "custom"
export const STREAM_SESSION_FILLER_TYPE = "stream-fixture-filler"
export const STREAM_SESSION_USER_ROLE = "user"
export const STREAM_SESSION_MESSAGE_TYPE = "message"
export const STREAM_SESSION_MODEL_TYPE = "model_change"
export const STREAM_SESSION_THINKING_TYPE = "thinking_level_change"
export const STREAM_SESSION_PROVIDER = "fixture-provider"
export const STREAM_SESSION_MODEL = "fixture-model"
export const STREAM_SESSION_THINKING = "high"
export const STREAM_SESSION_AFTER = "continuada"
export const STREAM_SESSION_NEWLINE = "\n"
export const STREAM_SESSION_INVALID = /inválido/
export const STREAM_SESSION_DIVERGENT = /divergente/
export const STREAM_SESSION_BAD_JSON = "{broken\n"
export const STREAM_SESSION_BAD_ENTRY = '{"type":""}\n'
export const STREAM_SESSION_TRUNCATED_JSON = '{"type":"message"'
export const STREAM_SESSION_WRONG_ID = "different-session"
export const STREAM_SESSION_BAD_UTF8 = Buffer.from([0xc3, 0x28])
export const STREAM_SESSION_TRUNCATED_UTF8 = Buffer.from([0xf0, 0x9f, 0x99])
export const STREAM_SESSION_READ_CHUNK_BYTES = 65_536
export const STREAM_SESSION_SPLIT_TEXT = "🙂"
export const STREAM_SESSION_PADDING_PREFIX = ',"padding":"'
export const STREAM_SESSION_PADDING_SUFFIX = '"}'
export const STREAM_SESSION_PADDING = " "
export const STREAM_SESSION_VERSION = 3
export const STREAM_SESSION_LARGE_TEST = "reabre mais de 32MiB com SDK nativo, ramo, checkpoint e continuidade"
export const STREAM_SESSION_JSON_TEST = "recusa JSON malformado"
export const STREAM_SESSION_ENVELOPE_TEST = "recusa envelope inválido"
export const STREAM_SESSION_HEADER_TEST = "recusa header inválido"
export const STREAM_SESSION_TRUNCATED_JSON_TEST = "recusa última linha JSON truncada sem alterar arquivo"
export const STREAM_SESSION_UTF8_TEST = "recusa UTF8 inválido"
export const STREAM_SESSION_TRUNCATED_UTF8_TEST = "recusa UTF8 incompleto no EOF"
export const STREAM_SESSION_IDENTITY_TEST = "recusa identidade antes de open nativo acrescentar newline"
export const STREAM_SESSION_FINAL_LINE_TEST = "preserva aceitação de JSON completo sem newline final e append nativo"
export const STREAM_SESSION_SPLIT_UTF8_TEST = "preserva UTF8 multibyte dividido entre chunks"
export const STREAM_SESSION_SUITE = "sessões JSONL streaming com SDK real"
export const STREAM_SESSION_UNICODE_SUFFIXES = ["\u00a0", "\ufeff\n", "\u2003\n\u00a0", "\n\u2003", " \r\n\t"]
export const STREAM_SESSION_UNICODE_INTERIOR = "\u2003\n"
export const STREAM_SESSION_INITIAL_BOM = "\ufeff"
export const STREAM_SESSION_ZERO_WIDTH_SUFFIX = "\u200b"
export const STREAM_SESSION_SUFFIX_ENTRY = {
  type: "custom",
  id: "entry",
  parentId: null,
  timestamp: STREAM_SESSION_TIMESTAMP,
  customType: "suffix-fixture",
  data: 1,
}
export const STREAM_SESSION_SUFFIX_TEST = "aceita whitespace Unicode somente no sufixo global e abre SDK"
export const STREAM_SESSION_INTERIOR_UNICODE_TEST = "recusa whitespace Unicode antes de outro registro"
export const STREAM_SESSION_INITIAL_BOM_TEST = "recusa BOM inicial"
export const STREAM_SESSION_ZERO_WIDTH_TEST = "recusa U200B final"
export const STREAM_SESSION_HEADER_SUFFIX_TEST = "validação preserva trimEnd global do header sem aplicar trim inicial"
