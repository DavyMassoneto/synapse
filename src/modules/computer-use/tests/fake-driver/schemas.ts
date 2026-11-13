import { Type } from "typebox"

export const COMPUTER_FAKE_REQUEST_SCHEMA = Type.Object({
  jsonrpc: Type.String(),
  id: Type.Optional(Type.Integer()),
  method: Type.String(),
  params: Type.Optional(
    Type.Object({
      name: Type.Optional(Type.String()),
      arguments: Type.Optional(
        Type.Object({
          text: Type.Optional(Type.String()),
          key: Type.Optional(Type.String()),
          keys: Type.Optional(Type.Array(Type.String())),
          element_index: Type.Optional(Type.Integer()),
          pid: Type.Optional(Type.Integer()),
          window_id: Type.Optional(Type.Integer()),
          value: Type.Optional(Type.String()),
          direction: Type.Optional(Type.String()),
          amount: Type.Optional(Type.Number()),
          button: Type.Optional(Type.String()),
          from_element: Type.Optional(Type.Integer()),
          to_element: Type.Optional(Type.Integer()),
        }),
      ),
    }),
  ),
})
