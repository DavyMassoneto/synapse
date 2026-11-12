import { Type } from "typebox"

export const IPHONE_HTTP_HOME_MAX_ELEMENTS = 400

export const IPHONE_HTTP_HOME_SWIPE_RATIO = 0.3

export const IPHONE_HTTP_HOME_SWIPE_SECONDS = 0.3

export const IPHONE_HTTP_HOME_TAP_MS = 0

export const IPHONE_HTTP_HOME_KEYS = "keys"

export const IPHONE_HTTP_HOME_DRAG = "dragFromToForDuration"

export const IPHONE_HTTP_HOME_LEFT = "left"

export const IPHONE_HTTP_POST = "POST"

export const IPHONE_HTTP_GET = "GET"

export const IPHONE_HTTP_DELETE = "DELETE"

export const IPHONE_HTTP_JSON = "application/json"

export const IPHONE_HTTP_CONTENT_TYPE = "content-type"

export const IPHONE_HTTP_START_ATTEMPTS = 40

export const IPHONE_HTTP_START_INTERVAL_MS = 500

export const IPHONE_HTTP_START_FAILURE = "O servidor Appium não iniciou no prazo."

export const IPHONE_HTTP_TIMEOUT_MS = 120000

export const IPHONE_HTTP_SESSION_TIMEOUT_MS = 900000

export const IPHONE_HTTP_STATUS = "status"

export const IPHONE_HTTP_SESSION = "session"

export const IPHONE_HTTP_SOURCE = "source"

export const IPHONE_HTTP_RECT = "window/rect"

export const IPHONE_HTTP_ACTIONS = "actions"

export const IPHONE_HTTP_POINTER = "pointer"

export const IPHONE_HTTP_FINGER = "finger1"

export const IPHONE_HTTP_TOUCH = "touch"

export const IPHONE_HTTP_SCREENSHOT = "screenshot"

export const IPHONE_HTTP_EXECUTE = "execute/sync"

export const IPHONE_HTTP_NO_BOOTED_SIMULATOR = "Nenhum simulador iniciado foi encontrado."

export const IPHONE_HTTP_INVALID_RESPONSE = "Resposta WebDriver inválida."

export const IPHONE_HTTP_SUCCESS_SCHEMA = Type.Object({
  value: Type.Union([Type.Null(), Type.Boolean(), Type.Number(), Type.String(), Type.Object({})]),
})

export const IPHONE_HTTP_ERROR_SCHEMA = Type.Object({
  value: Type.Object({ error: Type.String(), message: Type.String() }),
})

export const IPHONE_HTTP_RESPONSE_SCHEMA = Type.Union([IPHONE_HTTP_ERROR_SCHEMA, IPHONE_HTTP_SUCCESS_SCHEMA])

export const IPHONE_HTTP_SESSION_SCHEMA = Type.Object({
  value: Type.Object({ sessionId: Type.String({ minLength: 1 }) }),
})

export const IPHONE_HTTP_STRING_SCHEMA = Type.Object({ value: Type.String() })

export const IPHONE_HTTP_MOBILE_PREFIX = "mobile: "

export const IPHONE_HTTP_ELEMENT_ROOT = "element"

export const IPHONE_HTTP_ELEMENT_VALUE = "value"

export const IPHONE_HTTP_ELEMENT_CLEAR = "clear"

export const IPHONE_HTTP_URL = "url"

export const IPHONE_HTTP_ORIENTATION = "orientation"

export const IPHONE_HTTP_ELEMENT = "element/active"

export const IPHONE_HTTP_ELEMENT_ID = "element-6066-11e4-a52e-4f735466cecf"

export const IPHONE_HTTP_ELEMENT_SCHEMA = Type.Object({
  value: Type.Object({ [IPHONE_HTTP_ELEMENT_ID]: Type.String({ minLength: 1 }) }),
})

export const IPHONE_HTTP_RECT_SCHEMA = Type.Object({
  value: Type.Object({ x: Type.Number(), y: Type.Number(), width: Type.Number(), height: Type.Number() }),
})

export const IPHONE_HTTP_MOBILE_TERMINATE = "terminateApp"

export const IPHONE_HTTP_MOBILE_TERMINATE_SCHEMA = Type.Object({ value: Type.Boolean() })

export const IPHONE_HTTP_MOBILE_LAUNCH = "launchApp"

export const IPHONE_HTTP_MOBILE_LAUNCH_SCHEMA = Type.Object({
  value: Type.Union([Type.Null(), Type.Object({ pid: Type.Number() })]),
})

export const IPHONE_HTTP_MOBILE_RESULT_SCHEMA = Type.Object({ value: Type.Null() })

export const IPHONE_HTTP_INFO_SCHEMA = Type.Object({
  value: Type.Object({
    name: Type.Optional(Type.String()),
    bundleId: Type.Optional(Type.String()),
    model: Type.Optional(Type.String()),
    osVersion: Type.Optional(Type.String()),
  }),
})

export const IPHONE_HTTP_EMPTY_SCHEMA = Type.Object({ value: Type.Null() })
