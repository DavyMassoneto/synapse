import { Type } from "typebox"
import {
  COMPUTER_BACKGROUND,
  COMPUTER_COORDINATE_RECOMMENDATION,
  COMPUTER_EFFECT_CONFIRMED,
  COMPUTER_EFFECT_SUSPECTED_NOOP,
  COMPUTER_EFFECT_UNVERIFIABLE,
  COMPUTER_FOREGROUND,
  COMPUTER_JPEG_MIME,
  COMPUTER_PNG_MIME,
  COMPUTER_SET_VALUE,
  COMPUTER_TIMEOUT_UNKNOWN,
  COMPUTER_TRANSPORT_UNKNOWN,
  COMPUTER_TYPE_INCOMPLETE,
  COMPUTER_WINDOW_NOT_FOUND,
  COMPUTER_WINDOW_OWNER_MISMATCH,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_RESPONSE_CODE_BACKGROUND_UNAVAILABLE,
  COMPUTER_RESPONSE_CODE_TOOL_INVOCATION_FAILED,
  COMPUTER_RESPONSE_EFFECT_REFUSED,
} from "./constants"

export const COMPUTER_RAW_RECTANGLE_SCHEMA = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  width: Type.Number(),
  height: Type.Number(),
})

export const COMPUTER_RAW_WINDOW_SCHEMA = Type.Object({
  app_name: Type.String(),
  pid: Type.Integer({ minimum: 1 }),
  window_id: Type.Integer({ minimum: 1 }),
  is_on_screen: Type.Boolean(),
  title: Type.String(),
  z_index: Type.Number(),
  bounds: Type.Optional(COMPUTER_RAW_RECTANGLE_SCHEMA),
})

export const COMPUTER_RAW_APP_BASE_SCHEMA = Type.Object({
  name: Type.String(),
  bundle_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
})

export const COMPUTER_RAW_APP_SCHEMA = Type.Union([
  Type.Object({
    ...COMPUTER_RAW_APP_BASE_SCHEMA.properties,
    pid: Type.Integer({ minimum: 1 }),
    running: Type.Literal(true),
  }),
  Type.Object({
    ...COMPUTER_RAW_APP_BASE_SCHEMA.properties,
    pid: Type.Literal(0),
    running: Type.Literal(false),
  }),
])

export const COMPUTER_RAW_ELEMENT_SCHEMA = Type.Object({
  element_index: Type.Integer({ minimum: 0 }),
  role: Type.String(),
  label: Type.Optional(Type.String()),
  element_token: Type.Optional(Type.String()),
  depth: Type.Optional(Type.Integer({ minimum: 0 })),
  enabled: Type.Optional(Type.Boolean()),
  parent_index: Type.Optional(Type.Integer({ minimum: 0 })),
  actions: Type.Optional(Type.Array(Type.String())),
  value: Type.Optional(Type.String()),
  frame: Type.Optional(Type.Object({ x: Type.Number(), y: Type.Number(), w: Type.Number(), h: Type.Number() })),
  screenshot_frame: Type.Optional(
    Type.Object({ x: Type.Number(), y: Type.Number(), w: Type.Number(), h: Type.Number() }),
  ),
})

export const COMPUTER_RAW_REFUSAL_SCHEMA = Type.Object({
  code: Type.Optional(Type.String()),
  message: Type.Optional(Type.String()),
  hint: Type.Optional(Type.String()),
})

export const COMPUTER_RAW_ACTION_ERROR_SCHEMA = Type.Object({
  code: Type.Optional(Type.String()),
  message: Type.Optional(Type.String()),
  hint: Type.Optional(Type.String()),
})

export const COMPUTER_RAW_DELIVERY_SCHEMA = Type.Object({
  mode: Type.Optional(Type.Union([Type.Literal(COMPUTER_BACKGROUND), Type.Literal(COMPUTER_FOREGROUND)])),
})

export const COMPUTER_RAW_STATE_SCHEMA = Type.Object({
  message: Type.Optional(Type.String()),
  app_name: Type.Optional(Type.String()),
  pid: Type.Optional(Type.Integer({ minimum: 1 })),
  window_id: Type.Optional(Type.Integer({ minimum: 1 })),
  window_title: Type.Optional(Type.String()),
  window_bounds: Type.Optional(COMPUTER_RAW_RECTANGLE_SCHEMA),
  capture_id: Type.Optional(Type.String()),
  snapshot_id: Type.Optional(Type.String()),
  tree_format: Type.Optional(Type.Union([Type.Literal("markdown"), Type.Literal("elements"), Type.Literal("both")])),
  truncated: Type.Optional(Type.Boolean()),
  elements_complete: Type.Optional(Type.Boolean()),
  element_count: Type.Optional(Type.Integer({ minimum: 0 })),
  returned_element_count: Type.Optional(Type.Integer({ minimum: 0 })),
  total_element_count: Type.Optional(Type.Integer({ minimum: 0 })),
  timeout_ms: Type.Optional(Type.Integer({ minimum: 0 })),
  screenshot_width: Type.Optional(Type.Integer({ minimum: 1 })),
  screenshot_height: Type.Optional(Type.Integer({ minimum: 1 })),
  screenshot_file_path: Type.Optional(Type.String()),
  summary: Type.Optional(Type.String()),
  route: Type.Optional(Type.String()),
  delivery: Type.Optional(COMPUTER_RAW_DELIVERY_SCHEMA),
  refusal: Type.Optional(COMPUTER_RAW_REFUSAL_SCHEMA),
  error: Type.Optional(COMPUTER_RAW_ACTION_ERROR_SCHEMA),
  hint: Type.Optional(Type.String()),
  windows: Type.Optional(Type.Array(COMPUTER_RAW_WINDOW_SCHEMA)),
  apps: Type.Optional(Type.Array(COMPUTER_RAW_APP_SCHEMA)),
  elements: Type.Optional(Type.Array(COMPUTER_RAW_ELEMENT_SCHEMA)),
  tree_markdown: Type.Optional(Type.String()),
  screenshot_png_b64: Type.Optional(Type.String()),
  screenshot_mime_type: Type.Optional(Type.Union([Type.Literal(COMPUTER_PNG_MIME), Type.Literal(COMPUTER_JPEG_MIME)])),
  verified: Type.Optional(Type.Boolean()),
  effect: Type.Optional(
    Type.Union([
      Type.Literal(COMPUTER_EFFECT_CONFIRMED),
      Type.Literal(COMPUTER_EFFECT_UNVERIFIABLE),
      Type.Literal(COMPUTER_EFFECT_SUSPECTED_NOOP),
      Type.Literal(COMPUTER_RESPONSE_EFFECT_REFUSED),
    ]),
  ),
  code: Type.Optional(
    Type.Union([
      Type.Literal(COMPUTER_TYPE_INCOMPLETE),
      Type.Literal(COMPUTER_TIMEOUT_UNKNOWN),
      Type.Literal(COMPUTER_TRANSPORT_UNKNOWN),
      Type.Literal(COMPUTER_WINDOW_NOT_FOUND),
      Type.Literal(COMPUTER_WINDOW_OWNER_MISMATCH),
      Type.Literal(COMPUTER_RESPONSE_CODE_TOOL_INVOCATION_FAILED),
      Type.Literal(COMPUTER_RESPONSE_CODE_BACKGROUND_UNAVAILABLE),
    ]),
  ),
  escalation: Type.Optional(
    Type.Object({
      recommended: Type.Optional(
        Type.Union([
          Type.Literal(COMPUTER_SET_VALUE),
          Type.Literal(COMPUTER_COORDINATE_RECOMMENDATION),
          Type.Literal(COMPUTER_FOREGROUND),
        ]),
      ),
      reason: Type.Optional(Type.String()),
    }),
  ),
  delivered_chars: Type.Optional(Type.Integer()),
  requested_chars: Type.Optional(Type.Integer()),
})

export const COMPUTER_RAW_TEXT_PART_SCHEMA = Type.Object({ type: Type.Literal("text"), text: Type.String() })

export const COMPUTER_RAW_IMAGE_PART_SCHEMA = Type.Object({
  type: Type.Literal("image"),
  data: Type.String(),
  mimeType: Type.Union([Type.Literal(COMPUTER_PNG_MIME), Type.Literal(COMPUTER_JPEG_MIME)]),
})

export const COMPUTER_RAW_ENVELOPE_SCHEMA = Type.Object({
  content: Type.Array(Type.Union([COMPUTER_RAW_TEXT_PART_SCHEMA, COMPUTER_RAW_IMAGE_PART_SCHEMA])),
  structuredContent: Type.Optional(COMPUTER_RAW_STATE_SCHEMA),
  isError: Type.Optional(Type.Boolean()),
})

export const COMPUTER_RAW_INPUT_PROPERTIES_SCHEMA = Type.Object({
  element_token: Type.Optional(Type.Object({ type: Type.String() })),
  delivery_mode: Type.Optional(Type.Object({ type: Type.String() })),
  x: Type.Optional(Type.Object({ type: Type.String() })),
  tree_format: Type.Optional(Type.Object({ type: Type.String() })),
  max_elements: Type.Optional(Type.Object({ type: Type.String() })),
})

export const COMPUTER_RAW_TOOL_SCHEMA = Type.Object({
  name: Type.String(),
  inputSchema: Type.Object({ properties: Type.Optional(COMPUTER_RAW_INPUT_PROPERTIES_SCHEMA) }),
})

export const COMPUTER_RAW_TOOLS_SCHEMA = Type.Object({ tools: Type.Array(COMPUTER_RAW_TOOL_SCHEMA) })

export const COMPUTER_RAW_HANDSHAKE_SCHEMA = Type.Object({
  protocolVersion: Type.String(),
  serverInfo: Type.Object({ name: Type.String(), version: Type.String() }),
  capabilities: Type.Object({}),
})

export const COMPUTER_RAW_NOTIFICATION_SCHEMA = Type.Object({ jsonrpc: Type.Literal("2.0"), method: Type.String() })

export const COMPUTER_RAW_RPC_SCHEMA = Type.Object({
  jsonrpc: Type.Literal("2.0"),
  id: Type.Integer(),
  result: Type.Optional(
    Type.Union([COMPUTER_RAW_ENVELOPE_SCHEMA, COMPUTER_RAW_TOOLS_SCHEMA, COMPUTER_RAW_HANDSHAKE_SCHEMA]),
  ),
  error: Type.Optional(Type.Object({ code: Type.Integer(), message: Type.String() })),
})

export const COMPUTER_RAW_MANIFEST_SCHEMA = Type.Object({
  binary_version: Type.String(),
  mcp_invocation: Type.Object({ command: Type.String(), args: Type.Array(Type.String()) }),
})
