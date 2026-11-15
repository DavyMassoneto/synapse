import { Type } from "typebox"

export const COMPUTER_UNITY_BRIDGE_TEST_REQUEST_SCHEMA = Type.Object({
  op: Type.String(),
  token: Type.String(),
  x: Type.Optional(Type.Number()),
  y: Type.Optional(Type.Number()),
  hover: Type.Optional(Type.Boolean()),
})
