import { Type } from "typebox"

export const COMPUTER_FIXTURE_DRIVER_REQUEST_SCHEMA = Type.Object({
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

export const COMPUTER_FIXTURE_DRIVER_VERSION = "0.21.0"

export const COMPUTER_FIXTURE_DRIVER_TOOL_NAMES = [
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

export const COMPUTER_FIXTURE_DRIVER_MANIFEST = "manifest"

export const COMPUTER_FIXTURE_DRIVER_CALL = "call"

export const COMPUTER_FIXTURE_DRIVER_LINE = "line"

export const COMPUTER_FIXTURE_DRIVER_NOTIFICATIONS_MESSAGE = "notifications/message"

export const COMPUTER_FIXTURE_DRIVER_2_0 = "2.0"

export const COMPUTER_FIXTURE_DRIVER_LIST_WINDOWS = "list_windows"

export const COMPUTER_FIXTURE_DRIVER_LIST_APPS = "list_apps"

export const COMPUTER_FIXTURE_DRIVER_GET_WINDOW_STATE = "get_window_state"

export const COMPUTER_FIXTURE_DRIVER_LOG_VARIABLE = "COMPUTER_FIXTURE_DRIVER_LOG"

export const COMPUTER_FIXTURE_DRIVER_INFO_LEVEL = "info"

export const COMPUTER_FIXTURE_DRIVER_SERVER_NAME = "fake"

export const COMPUTER_FIXTURE_DRIVER_STRING_TYPE = "string"

export const COMPUTER_FIXTURE_DRIVER_INTEGER_TYPE = "integer"

export const COMPUTER_FIXTURE_DRIVER_MISSING_PROTOCOL = "Protocolo do driver falso não informado."

export const COMPUTER_FIXTURE_DRIVER_IMPORT_FLAG = "--import"

export const COMPUTER_FIXTURE_DRIVER_TSX = "tsx"

export const COMPUTER_FIXTURE_DRIVER_FILE = "./driver.ts"

export const COMPUTER_FIXTURE_DRIVER_PROTOCOL_SCHEMA = Type.Object({
  initialize: Type.String(),
  toolsList: Type.String(),
  toolsCall: Type.String(),
  version: Type.String(),
})
