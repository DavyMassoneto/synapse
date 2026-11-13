import { Type } from "typebox"

export const PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA = Type.Object(
  { command: Type.String({ minLength: 1 }), arguments: Type.Array(Type.String()) },
  { additionalProperties: false },
)
