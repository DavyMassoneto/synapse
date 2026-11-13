import { Type } from "typebox"

export const PI_REQUEST_LOG_CONTENT_SCHEMA = Type.Union([
  Type.String(),
  Type.Array(Type.Object({ type: Type.String(), text: Type.Optional(Type.String()) })),
])

export const PI_REQUEST_LOG_SCHEMA = Type.Object({
  messages: Type.Array(Type.Object({ role: Type.String(), content: PI_REQUEST_LOG_CONTENT_SCHEMA })),
})
