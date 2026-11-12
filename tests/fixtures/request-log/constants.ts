import { Type } from "typebox"

export const PI_REQUEST_LOG_FILE = "requests.jsonl"

export const PI_REQUEST_LOG_VARIABLE = "SYNAPSE_TEST_LOG"

export const PI_REQUEST_LOG_CONTENT_SCHEMA = Type.Union([
  Type.String(),
  Type.Array(Type.Object({ type: Type.String(), text: Type.Optional(Type.String()) })),
])

export const PI_REQUEST_LOG_SCHEMA = Type.Object({
  messages: Type.Array(Type.Object({ role: Type.String(), content: PI_REQUEST_LOG_CONTENT_SCHEMA })),
})

export const PI_REQUEST_LOG_USER_ROLE = "user"

export const PI_REQUEST_LOG_NO_USER_MESSAGE = "Pedido sem mensagem de usuário"

export const PI_REQUEST_LOG_NEWLINE = "\n"

export const PI_REQUEST_LOG_ENCODING = "utf8"

export const PI_REQUEST_LOG_MISSING_REQUEST = "Pedido do provedor não encontrado."

export const PI_REQUEST_LOG_TEXT_KIND = "text"
