import { type IphoneFixtureRoutes } from "./types"
export const IPHONE_FIXTURE_BIND = "127.0.0.1"

export const IPHONE_FIXTURE_SERVER_ERROR = "Servidor falso sem endereço."

export const IPHONE_FIXTURE_SOURCE =
  '<root><XCUIElementTypeApplication name="Teste" visible="true" enabled="true" x="0" y="0" width="440" height="956"/></root>'

export const IPHONE_FIXTURE_PREFIX = "synapse-iphone-"

export const IPHONE_FIXTURE_CONFIG_FILE = "iphone.json"

export const IPHONE_FIXTURE_STATE = "state"

export const IPHONE_FIXTURE_ENCODING = "utf8"

export const IPHONE_FIXTURE_TOOL_MISSING = "Ferramenta iPhone não registrada."

export const IPHONE_FIXTURE_ROUTES: IphoneFixtureRoutes = {
  "/status": '{"ready":true}',
  "/session": '{"sessionId":"fake"}',
  "/source": JSON.stringify(IPHONE_FIXTURE_SOURCE),
  "/window/rect": '{"x":0,"y":0,"width":440,"height":956}',
  "/screenshot": '"base64"',
}

export const IPHONE_FIXTURE_HTTP_OK = 200

export const IPHONE_FIXTURE_HTTP_HEADERS = { "content-type": "application/json" }

export const IPHONE_FIXTURE_HTTP_NULL = "null"

export const IPHONE_FIXTURE_ROUTE_PREFIX = "/session/fake"

export const IPHONE_FIXTURE_HTTP_POST = "POST"

export const IPHONE_FIXTURE_DEFAULT_METHOD = "GET"

export const IPHONE_FIXTURE_EMPTY_PATH = "/"

export const IPHONE_FIXTURE_ROUTE_STATUS = "/status"

export const IPHONE_FIXTURE_ROUTE_SOURCE = "/source"

export const IPHONE_FIXTURE_ROUTE_RECT = "/window/rect"

export const IPHONE_FIXTURE_ROUTE_SCREENSHOT = "/screenshot"

export const IPHONE_FIXTURE_ROUTE_SESSION = "/session"

export const IPHONE_FIXTURE_EMPTY_TEXT = ""

export const IPHONE_FIXTURE_PROMPT = "Olá\u2028mundo\u2029!"

export const IPHONE_FIXTURE_REPLY = "ok"
