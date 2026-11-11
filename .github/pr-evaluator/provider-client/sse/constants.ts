import { Type } from "typebox"

export const EVENT_LINE_BREAK = "\n"

export const DATA_PREFIX = "data:"

export const DONE_PAYLOAD = "[DONE]"

export const MAX_STREAM_BYTES = 33_554_432

export const PROVIDER_ERROR_PREFIX = "Erro do provedor"

export const PROVIDER_ERROR_WITHOUT_MESSAGE = "Erro do provedor sem mensagem"

export const StreamChunkSchema = Type.Object({
  error: Type.Optional(Type.Object({ message: Type.Optional(Type.String()) })),
  choices: Type.Optional(
    Type.Array(
      Type.Object({
        delta: Type.Object({
          tool_calls: Type.Optional(
            Type.Array(
              Type.Object({
                index: Type.Integer({ minimum: 0 }),
                function: Type.Optional(
                  Type.Object({ name: Type.Optional(Type.String()), arguments: Type.Optional(Type.String()) }),
                ),
              }),
            ),
          ),
        }),
        finish_reason: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      }),
    ),
  ),
})
