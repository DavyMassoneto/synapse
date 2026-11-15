import { Type } from "typebox"

export const PI_COMPUTER_DRIVER_CONFIGURATION_SCHEMA = Type.Object(
  { command: Type.String({ minLength: 1 }), arguments: Type.Array(Type.String()) },
  { additionalProperties: false },
)

export const PI_COMPUTER_UNITY_BRIDGE_COMMAND_SCHEMA = Type.Object(
  { command: Type.String({ minLength: 1 }), arguments: Type.Array(Type.String()) },
  { additionalProperties: false },
)

export const PI_COMPUTER_UNITY_BRIDGE_CONFIGURATION_SCHEMA = Type.Object(
  {
    handshakeDirectory: Type.String({ minLength: 1 }),
    unityProbe: Type.Optional(PI_COMPUTER_UNITY_BRIDGE_COMMAND_SCHEMA),
    attachCommand: Type.Optional(PI_COMPUTER_UNITY_BRIDGE_COMMAND_SCHEMA),
  },
  { additionalProperties: false },
)
