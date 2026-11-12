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

export const COMPUTER_FAKE_VERSION = "0.21.0"

export const COMPUTER_FAKE_TOOL_NAMES = [
  "get_cursor_position",
  "start_session",
  "end_session",
  "list_windows",
  "list_apps",
  "get_window_state",
  "screenshot",
  "get_desktop_state",
  "click",
  "double_click",
  "drag",
  "scroll",
  "type_text",
  "set_value",
  "hotkey",
  "press_key",
  "bring_to_front",
]

export const COMPUTER_FAKE_INITIALIZE = "initialize"

export const COMPUTER_FAKE_TOOLS_LIST = "tools/list"

export const COMPUTER_FAKE_TOOLS_CALL = "tools/call"

export const COMPUTER_FAKE_MANIFEST = "manifest"

export const COMPUTER_FAKE_CALL = "call"

export const COMPUTER_FAKE_LINE = "line"

export const COMPUTER_FAKE_NOTIFICATIONS_MESSAGE = "notifications/message"

export const COMPUTER_FAKE_2_0 = "2.0"

export const COMPUTER_FAKE_TIMEOUT = "timeout"

export const COMPUTER_FAKE_RPC_ERROR = "rpc-error"

export const COMPUTER_FAKE_DISCONNECT_ONCE = "disconnect-once"

export const COMPUTER_FAKE_DISCONNECT = "disconnect"

export const COMPUTER_FAKE_INVALID = "invalid"

export const COMPUTER_FAKE_LIST_WINDOWS = "list_windows"

export const COMPUTER_FAKE_LIST_APPS = "list_apps"

export const COMPUTER_FAKE_CLICK = "click"

export const COMPUTER_FAKE_GET_WINDOW_STATE = "get_window_state"

export const COMPUTER_FAKE_LOG_VARIABLE = "COMPUTER_FAKE_LOG"

export const COMPUTER_FAKE_SCENARIO_VARIABLE = "COMPUTER_FAKE_SCENARIO"

export const COMPUTER_FAKE_MARKER_VARIABLE = "COMPUTER_FAKE_MARKER"

export const COMPUTER_FAKE_INFO_LEVEL = "info"

export const COMPUTER_FAKE_SERVER_NAME = "fake"

export const COMPUTER_FAKE_PROTOCOL = "2025-06-18"

export const COMPUTER_FAKE_STRING_TYPE = "string"

export const COMPUTER_FAKE_INTEGER_TYPE = "integer"
