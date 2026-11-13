import { Type } from "typebox"
import {
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
} from "#synapse/modules/computer-use/public/contracts"

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

export const COMPUTER_RAW_APP_SCHEMA = Type.Object({
  name: Type.String(),
  pid: Type.Integer({ minimum: 1 }),
  running: Type.Boolean(),
  bundle_id: Type.Optional(Type.String()),
})

export const COMPUTER_RAW_ELEMENT_SCHEMA = Type.Object({
  element_index: Type.Integer({ minimum: 1 }),
  role: Type.String(),
  label: Type.String(),
  element_token: Type.Optional(Type.String()),
  frame: Type.Optional(Type.Object({ x: Type.Number(), y: Type.Number(), w: Type.Number(), h: Type.Number() })),
})

export const COMPUTER_RAW_STATE_SCHEMA = Type.Object({
  message: Type.Optional(Type.String()),
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
    ]),
  ),
  code: Type.Optional(
    Type.Union([
      Type.Literal(COMPUTER_TYPE_INCOMPLETE),
      Type.Literal(COMPUTER_TIMEOUT_UNKNOWN),
      Type.Literal(COMPUTER_TRANSPORT_UNKNOWN),
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
