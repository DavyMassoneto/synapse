import { Type } from "typebox"

export const COMPUTER_MOUNT_INPUT_SCHEMA = Type.Object({
  element_token: Type.String(),
  delivery_mode: Type.String(),
  x: Type.Integer(),
})

export const COMPUTER_MOUNT_REQUEST_SCHEMA = Type.Object({
  jsonrpc: Type.Literal("2.0"),
  id: Type.Optional(Type.Integer()),
  method: Type.String(),
  params: Type.Optional(Type.Object({ name: Type.Optional(Type.String()) })),
})

export const COMPUTER_MOUNT_EVENT_SCHEMA = Type.Object({ name: Type.String() })
