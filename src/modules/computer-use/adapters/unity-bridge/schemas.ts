import { Type } from "typebox"
import { COMPUTER_BACKGROUND, COMPUTER_DRIVER_LEFT_BUTTON } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_UNITY_BRIDGE_PORT_MAXIMUM, COMPUTER_UNITY_BRIDGE_PORT_MINIMUM } from "./constants"

export const COMPUTER_UNITY_BRIDGE_POINTER_SCHEMA = Type.Object({
  pid: Type.Integer({ minimum: 1 }),
  window_id: Type.Integer({ minimum: 1 }),
  x: Type.Number(),
  y: Type.Number(),
  element_index: Type.Optional(Type.Never()),
  element_token: Type.Optional(Type.Never()),
  modifier: Type.Optional(Type.Never()),
  button: Type.Optional(Type.Literal(COMPUTER_DRIVER_LEFT_BUTTON)),
  delivery_mode: Type.Optional(Type.Literal(COMPUTER_BACKGROUND)),
})

export const COMPUTER_UNITY_BRIDGE_NULLABLE_STRING_SCHEMA = Type.Union([Type.String(), Type.Null()])

export const COMPUTER_UNITY_BRIDGE_RECTANGLE_SCHEMA = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
  w: Type.Number(),
  h: Type.Number(),
})

export const COMPUTER_UNITY_BRIDGE_SCREEN_SCHEMA = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
})

export const COMPUTER_UNITY_BRIDGE_GEOMETRY_SCHEMA = Type.Object({
  window: COMPUTER_UNITY_BRIDGE_RECTANGLE_SCHEMA,
  client: COMPUTER_UNITY_BRIDGE_RECTANGLE_SCHEMA,
  caption_offset: Type.Number(),
  window_class: Type.String(),
  hwnd: Type.Integer(),
})

export const COMPUTER_UNITY_BRIDGE_CAPABILITIES_SCHEMA = Type.Object({
  tree: Type.Boolean(),
  hit: Type.Boolean(),
  click: Type.Boolean(),
  key: Type.Boolean(),
  text: Type.Boolean(),
  scroll: Type.Optional(Type.Boolean()),
  drag: Type.Optional(Type.Boolean()),
  ids: Type.Optional(Type.Boolean()),
  texts: Type.Optional(Type.Boolean()),
  generation: Type.Optional(Type.Boolean()),
})

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_SCHEMA = Type.Object({
  protocol: Type.Integer(),
  state: Type.String(),
  pid: Type.Integer({ minimum: 1 }),
  process_name: Type.String(),
  instance: Type.String({ minLength: 1 }),
  token: Type.String({ minLength: 1 }),
  port: Type.Integer({ minimum: COMPUTER_UNITY_BRIDGE_PORT_MINIMUM, maximum: COMPUTER_UNITY_BRIDGE_PORT_MAXIMUM }),
  endpoint: Type.String(),
  unity_version: Type.String(),
  scene: Type.String(),
  unity_screen: COMPUTER_UNITY_BRIDGE_SCREEN_SCHEMA,
  event_system: Type.Boolean(),
  gameobject_created: Type.Boolean(),
  main_thread_captured: Type.Boolean(),
  geometry: COMPUTER_UNITY_BRIDGE_GEOMETRY_SCHEMA,
  capabilities: COMPUTER_UNITY_BRIDGE_CAPABILITIES_SCHEMA,
})

export const COMPUTER_UNITY_BRIDGE_PING_SCHEMA = Type.Object({
  status: Type.String(),
  protocol: Type.Integer(),
  pid: Type.Integer({ minimum: 1 }),
  instance: Type.String({ minLength: 1 }),
  main_thread_ticks: Type.Integer({ minimum: 0 }),
  main_thread_captured: Type.Boolean(),
  gameobject_created: Type.Boolean(),
  state: Type.String(),
  unity_version: Type.String(),
  scene: Type.String(),
  screen: COMPUTER_UNITY_BRIDGE_SCREEN_SCHEMA,
  event_system: Type.Boolean(),
  generation: Type.Optional(Type.Integer({ minimum: 0 })),
  geometry: COMPUTER_UNITY_BRIDGE_GEOMETRY_SCHEMA,
  capabilities: COMPUTER_UNITY_BRIDGE_CAPABILITIES_SCHEMA,
})

export const COMPUTER_UNITY_BRIDGE_CLICK_POINT_SCHEMA = Type.Object({
  client_x: Type.Number(),
  client_y: Type.Number(),
})

export const COMPUTER_UNITY_BRIDGE_CLICK_TARGET_SCHEMA = Type.Object({
  id: Type.Optional(Type.String()),
  path: Type.Optional(Type.String()),
  type: Type.Optional(Type.String()),
  label: Type.Optional(COMPUTER_UNITY_BRIDGE_NULLABLE_STRING_SCHEMA),
  is_toggle: Type.Optional(Type.Boolean()),
  is_on_before: Type.Optional(Type.Boolean()),
  is_on_after: Type.Optional(Type.Boolean()),
})

export const COMPUTER_UNITY_BRIDGE_SCROLL_DELTA_SCHEMA = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
})

export const COMPUTER_UNITY_BRIDGE_SCROLL_POSITION_SCHEMA = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
})

export const COMPUTER_UNITY_BRIDGE_SCROLL_RECT_SCHEMA = Type.Object({
  path: Type.String(),
  normalized_before: COMPUTER_UNITY_BRIDGE_SCROLL_POSITION_SCHEMA,
  normalized_after: COMPUTER_UNITY_BRIDGE_SCROLL_POSITION_SCHEMA,
})

export const COMPUTER_UNITY_BRIDGE_ACTION_DESKTOP_SCHEMA = Type.Object({
  cursor_moved: Type.Boolean(),
  foreground_changed: Type.Boolean(),
})

export const COMPUTER_UNITY_BRIDGE_ACTION_SCHEMA = Type.Object({
  status: Type.String(),
  protocol: Type.Optional(Type.Integer()),
  generation: Type.Optional(Type.Integer({ minimum: 0 })),
  route: Type.Optional(Type.String()),
  effect: Type.Optional(Type.String()),
  reason: Type.Optional(Type.String()),
  detail: Type.Optional(Type.String()),
  hint: Type.Optional(Type.String()),
  point: Type.Optional(COMPUTER_UNITY_BRIDGE_CLICK_POINT_SCHEMA),
  target: Type.Optional(COMPUTER_UNITY_BRIDGE_CLICK_TARGET_SCHEMA),
  scroll_delta: Type.Optional(COMPUTER_UNITY_BRIDGE_SCROLL_DELTA_SCHEMA),
  scroll_rect: Type.Optional(COMPUTER_UNITY_BRIDGE_SCROLL_RECT_SCHEMA),
  scrollbar: Type.Optional(
    Type.Object({
      path: Type.String(),
      value_before: Type.Number(),
      value_after: Type.Number(),
      size: Type.Number(),
    }),
  ),
  fallback: Type.Optional(Type.String()),
  manual_applied: Type.Optional(Type.Boolean()),
  normalized_changed: Type.Optional(Type.Boolean()),
  resolved_by: Type.Optional(Type.String()),
  handler_path: Type.Optional(Type.String()),
  from: Type.Optional(COMPUTER_UNITY_BRIDGE_CLICK_POINT_SCHEMA),
  to: Type.Optional(COMPUTER_UNITY_BRIDGE_CLICK_POINT_SCHEMA),
  steps: Type.Optional(Type.Integer({ minimum: 1 })),
  key: Type.Optional(Type.String()),
  input: Type.Optional(COMPUTER_UNITY_BRIDGE_CLICK_TARGET_SCHEMA),
  text_length: Type.Optional(Type.Integer({ minimum: 0 })),
  value_before: Type.Optional(Type.String()),
  value_after: Type.Optional(Type.String()),
  truncated: Type.Optional(Type.Boolean()),
  submitted: Type.Optional(Type.Boolean()),
  selected_before: Type.Optional(COMPUTER_UNITY_BRIDGE_CLICK_TARGET_SCHEMA),
  selected_after: Type.Optional(COMPUTER_UNITY_BRIDGE_CLICK_TARGET_SCHEMA),
  moved: Type.Optional(Type.Boolean()),
  action_desktop: Type.Optional(COMPUTER_UNITY_BRIDGE_ACTION_DESKTOP_SCHEMA),
})

export const COMPUTER_UNITY_BRIDGE_TREE_TEXT_SCHEMA = Type.Object({
  id: Type.Optional(Type.String()),
  kind: Type.Optional(Type.String()),
  path: Type.String(),
  text: Type.String(),
  selectable_id: Type.Optional(COMPUTER_UNITY_BRIDGE_NULLABLE_STRING_SCHEMA),
  screen_x: Type.Optional(Type.Number()),
  screen_y: Type.Optional(Type.Number()),
  screen_w: Type.Optional(Type.Number()),
  screen_h: Type.Optional(Type.Number()),
  client_x: Type.Optional(Type.Number()),
  client_y: Type.Optional(Type.Number()),
  client_w: Type.Optional(Type.Number()),
  client_h: Type.Optional(Type.Number()),
  depth: Type.Optional(Type.Integer()),
})

export const COMPUTER_UNITY_BRIDGE_TREE_ITEM_SCHEMA = Type.Object({
  id: Type.Optional(Type.String()),
  kind: Type.Optional(Type.String()),
  path: Type.String(),
  type: Type.String(),
  label: Type.Optional(COMPUTER_UNITY_BRIDGE_NULLABLE_STRING_SCHEMA),
  interactable: Type.Optional(Type.Boolean()),
  is_on: Type.Optional(Type.Boolean()),
  selected: Type.Optional(Type.Boolean()),
  screen_x: Type.Optional(Type.Number()),
  screen_y: Type.Optional(Type.Number()),
  screen_w: Type.Optional(Type.Number()),
  screen_h: Type.Optional(Type.Number()),
  client_x: Type.Optional(Type.Number()),
  client_y: Type.Optional(Type.Number()),
  client_w: Type.Optional(Type.Number()),
  client_h: Type.Optional(Type.Number()),
  cx: Type.Optional(Type.Number()),
  cy: Type.Optional(Type.Number()),
  depth: Type.Optional(Type.Integer()),
})

export const COMPUTER_UNITY_BRIDGE_TREE_SCHEMA = Type.Object({
  status: Type.String(),
  protocol: Type.Optional(Type.Integer()),
  generation: Type.Optional(Type.Integer({ minimum: 0 })),
  count: Type.Optional(Type.Integer()),
  returned: Type.Optional(Type.Integer()),
  screen: Type.Optional(COMPUTER_UNITY_BRIDGE_SCREEN_SCHEMA),
  geometry: Type.Optional(COMPUTER_UNITY_BRIDGE_GEOMETRY_SCHEMA),
  event_system: Type.Optional(Type.Boolean()),
  selected_id: Type.Optional(COMPUTER_UNITY_BRIDGE_NULLABLE_STRING_SCHEMA),
  items: Type.Array(COMPUTER_UNITY_BRIDGE_TREE_ITEM_SCHEMA),
  texts: Type.Optional(Type.Array(COMPUTER_UNITY_BRIDGE_TREE_TEXT_SCHEMA)),
})
