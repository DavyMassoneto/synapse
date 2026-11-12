import { Type } from "typebox"

export const PI_PROCESS_MANIFEST_SCHEMA = Type.Object({ pi: Type.Object({ extensions: Type.Tuple([Type.String()]) }) })

export const PI_PROCESS_SDK_SCHEMA = Type.Object({ bin: Type.Object({ pi: Type.String() }) })

export const PI_PROCESS_STATUS_SCHEMA = Type.Object({
  type: Type.Literal("extension_ui_request"),
  method: Type.Literal("setStatus"),
  id: Type.String(),
  statusKey: Type.String(),
  statusText: Type.Optional(Type.String()),
})

export const PI_PROCESS_NOTICE_SCHEMA = Type.Object({
  type: Type.Literal("extension_ui_request"),
  method: Type.Literal("notify"),
  id: Type.String(),
  notifyType: Type.String(),
  message: Type.String(),
})

export const PI_PROCESS_RECORD_SCHEMA = Type.Union([
  PI_PROCESS_STATUS_SCHEMA,
  PI_PROCESS_NOTICE_SCHEMA,
  Type.Object({
    type: Type.Literal("response"),
    command: Type.Literal("get_commands"),
    id: Type.Optional(Type.String()),
    success: Type.Literal(true),
    data: Type.Object({ commands: Type.Array(Type.Object({ name: Type.String(), source: Type.String() })) }),
  }),
  Type.Object({
    type: Type.Literal("response"),
    command: Type.Literal("get_commands"),
    id: Type.Optional(Type.String()),
    success: Type.Literal(false),
    error: Type.String({ minLength: 1 }),
  }),
  Type.Object({
    type: Type.Literal("response"),
    command: Type.Literal("prompt"),
    id: Type.Optional(Type.String()),
    success: Type.Boolean(),
  }),
  Type.Object({
    type: Type.Union([
      Type.Literal("agent_start"),
      Type.Literal("agent_end"),
      Type.Literal("agent_settled"),
      Type.Literal("turn_start"),
      Type.Literal("turn_end"),
      Type.Literal("message_start"),
      Type.Literal("message_end"),
      Type.Literal("message_update"),
      Type.Literal("tool_execution_start"),
      Type.Literal("tool_execution_update"),
      Type.Literal("tool_execution_end"),
      Type.Literal("entry_appended"),
      Type.Literal("queue_update"),
      Type.Literal("extension_error"),
      Type.Literal("auto_retry_start"),
      Type.Literal("auto_retry_end"),
      Type.Literal("compaction_start"),
      Type.Literal("compaction_end"),
    ]),
    id: Type.Optional(Type.String()),
    method: Type.Optional(Type.String()),
    message: Type.Optional(
      Type.Union([
        Type.String(),
        Type.Object({
          role: Type.String(),
          stopReason: Type.Optional(Type.String()),
          errorMessage: Type.Optional(Type.String()),
        }),
      ]),
    ),
    notifyType: Type.Optional(Type.String()),
    statusKey: Type.Optional(Type.String()),
    statusText: Type.Optional(Type.String()),
  }),
])
