export const COMPUTER_UNITY_BRIDGE_PROTOCOL_V1 = 1

export const COMPUTER_UNITY_BRIDGE_PROTOCOL_V2 = 2

export const COMPUTER_UNITY_BRIDGE_RUN_DIRECTORY = "run"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_FILE = "handshake.json"

export const COMPUTER_UNITY_BRIDGE_LISTENING_STATE = "listening"

export const COMPUTER_UNITY_BRIDGE_OK_STATUS = "ok"

export const COMPUTER_UNITY_BRIDGE_UNITY_WINDOW_CLASS = "UnityWndClass"

export const COMPUTER_UNITY_BRIDGE_LOOPBACK_HOST = "127.0.0.1"

export const COMPUTER_UNITY_BRIDGE_ENDPOINT_PREFIX = "tcp://127.0.0.1:"

export const COMPUTER_UNITY_BRIDGE_PORT_MINIMUM = 1

export const COMPUTER_UNITY_BRIDGE_PORT_MAXIMUM = 65535

export const COMPUTER_UNITY_BRIDGE_UTF8 = "utf8"

export const COMPUTER_UNITY_BRIDGE_WINDOWS_HIDE = true

export const COMPUTER_UNITY_BRIDGE_REQUEST_END = "\n"

export const COMPUTER_UNITY_BRIDGE_RESPONSE_END = "\n"

export const COMPUTER_UNITY_BRIDGE_MAX_RESPONSE_BYTES = 1_048_576

export const COMPUTER_UNITY_BRIDGE_TREE_TEXT_MAX_RESPONSE = 1_048_576

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_RETRY_DELAY_MILLISECONDS = 250

export const COMPUTER_UNITY_BRIDGE_ATTACH_POLL_MILLISECONDS = 250

export const COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTS = 16

export const COMPUTER_UNITY_BRIDGE_PING_OP = "ping"

export const COMPUTER_UNITY_BRIDGE_CLICK_OP = "click"

export const COMPUTER_UNITY_BRIDGE_TREE_OP = "tree"

export const COMPUTER_UNITY_BRIDGE_SCROLL_OP = "scroll"

export const COMPUTER_UNITY_BRIDGE_DRAG_OP = "drag"

export const COMPUTER_UNITY_BRIDGE_TEXT_OP = "text"

export const COMPUTER_UNITY_BRIDGE_KEY_OP = "key"

export const COMPUTER_UNITY_BRIDGE_STOP_OP = "stop"

export const COMPUTER_UNITY_BRIDGE_CLICK_TOOL = "click"

export const COMPUTER_UNITY_BRIDGE_SCROLL_TOOL = "scroll"

export const COMPUTER_UNITY_BRIDGE_DRAG_TOOL = "drag"

export const COMPUTER_UNITY_BRIDGE_TYPE_TOOL = "type_text"

export const COMPUTER_UNITY_BRIDGE_KEY_TOOL = "press_key"

export const COMPUTER_UNITY_BRIDGE_HOTKEY_TOOL = "hotkey"

export const COMPUTER_UNITY_BRIDGE_SET_VALUE_TOOL = "set_value"

export const COMPUTER_UNITY_BRIDGE_HOVER = true

export const COMPUTER_UNITY_BRIDGE_PING_TIMEOUT_MILLISECONDS = 2_000

export const COMPUTER_UNITY_BRIDGE_CLICK_TIMEOUT_MILLISECONDS = 15_000

export const COMPUTER_UNITY_BRIDGE_STOP_TIMEOUT_MILLISECONDS = 2_000

export const COMPUTER_UNITY_BRIDGE_WINDOW_STATE_TOOL = "get_window_state"

export const COMPUTER_UNITY_BRIDGE_TREE_TIMEOUT_MILLISECONDS = 15_000

export const COMPUTER_UNITY_BRIDGE_TREE_MAX_ITEMS = 200

export const COMPUTER_UNITY_BRIDGE_TREE_MAX_TEXTS = 64

export const COMPUTER_UNITY_BRIDGE_TREE_INCLUDE_TEXTS = true

export const COMPUTER_UNITY_BRIDGE_TREE_INCLUDE_OFFSCREEN = false

export const COMPUTER_UNITY_BRIDGE_SCROLL_AMOUNT_MINIMUM = 0.1

export const COMPUTER_UNITY_BRIDGE_SCROLL_AMOUNT_MAXIMUM = 10

export const COMPUTER_UNITY_BRIDGE_SCROLL_STEPS = 1

export const COMPUTER_UNITY_BRIDGE_DRAG_STEPS = 8

export const COMPUTER_UNITY_BRIDGE_TEXT_MAX_CHARS = 2_000

export const COMPUTER_UNITY_BRIDGE_DIRECTION_UP = "up"

export const COMPUTER_UNITY_BRIDGE_DIRECTION_DOWN = "down"

export const COMPUTER_UNITY_BRIDGE_DIRECTION_LEFT = "left"

export const COMPUTER_UNITY_BRIDGE_DIRECTION_RIGHT = "right"

export const COMPUTER_UNITY_BRIDGE_ELEMENT_ROLE_TEXT = "text"

export const COMPUTER_UNITY_BRIDGE_LABEL_SEPARATOR = " - "

export const COMPUTER_UNITY_BRIDGE_COMMAND_TIMEOUT_MILLISECONDS = 60_000

export const COMPUTER_UNITY_BRIDGE_COMMAND_MAX_OUTPUT_BYTES = 8_192

export const COMPUTER_UNITY_BRIDGE_COMMAND_DETAIL_MAX_CHARS = 400

export const COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS = "dispatched"

export const COMPUTER_UNITY_BRIDGE_REFUSED_STATUS = "refused"

export const COMPUTER_UNITY_BRIDGE_OUTCOME_UNKNOWN_STATUS = "outcome-unknown"

export const COMPUTER_UNITY_BRIDGE_GEOMETRY_TOLERANCE_PIXELS = 2

export const COMPUTER_UNITY_BRIDGE_TARGET_KEY_SEPARATOR = ":"

export const COMPUTER_UNITY_BRIDGE_DETAIL_SEPARATOR = " "

export const COMPUTER_UNITY_BRIDGE_WHITESPACE_PATTERN = /\s+/g

export const COMPUTER_UNITY_BRIDGE_STRING_EMPTY = ""

export const COMPUTER_UNITY_BRIDGE_KEY_RETURN = "Return"

export const COMPUTER_UNITY_BRIDGE_KEY_ESCAPE = "Escape"

export const COMPUTER_UNITY_BRIDGE_KEY_TAB = "Tab"

export const COMPUTER_UNITY_BRIDGE_KEY_UP = "Up"

export const COMPUTER_UNITY_BRIDGE_KEY_DOWN = "Down"

export const COMPUTER_UNITY_BRIDGE_KEY_LEFT = "Left"

export const COMPUTER_UNITY_BRIDGE_KEY_RIGHT = "Right"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_ABSENT = "handshake-absent"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_UNREADABLE = "handshake-unreadable"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PROTOCOL = "protocol-mismatch"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_STATE = "not-listening"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_TARGET = "target-mismatch"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_WINDOW_CLASS = "window-class-mismatch"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_ENDPOINT = "endpoint-mismatch"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_GEOMETRY = "geometry-invalid"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PUMP = "main-thread-not-captured"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_CAPABILITIES = "capabilities-unavailable"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PING = "ping-unavailable"

export const COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_RESPONSE = "response-invalid"

export const COMPUTER_UNITY_BRIDGE_ROUTE_TEXT = "Rota unity-bridge: "

export const COMPUTER_UNITY_BRIDGE_BRIDGE_ROUTE_TEXT = " Rota interna: "

export const COMPUTER_UNITY_BRIDGE_TARGET_TEXT = " Alvo: "

export const COMPUTER_UNITY_BRIDGE_CLIENT_POINT_TEXT = " Ponto no cliente: ("

export const COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR = ", "

export const COMPUTER_UNITY_BRIDGE_POINT_END = ")."

export const COMPUTER_UNITY_BRIDGE_DISPATCHED_TEXT =
  "clique entregue aos eventos UGUI da bridge; o efeito não foi verificado, capture o estado antes de repetir."

export const COMPUTER_UNITY_BRIDGE_SCROLL_DISPATCHED_TEXT =
  "rolagem entregue aos eventos UGUI da bridge; o efeito não foi verificado, capture o estado antes de repetir."

export const COMPUTER_UNITY_BRIDGE_DRAG_DISPATCHED_TEXT =
  "arrasto entregue aos eventos UGUI da bridge; o efeito não foi verificado, capture o estado antes de repetir."

export const COMPUTER_UNITY_BRIDGE_TEXT_DISPATCHED_TEXT =
  "texto entregue ao campo interno da bridge; o efeito não foi verificado, capture o estado antes de repetir."

export const COMPUTER_UNITY_BRIDGE_KEY_DISPATCHED_TEXT =
  "tecla entregue ao EventSystem interno da bridge; o efeito não foi verificado, capture o estado antes de repetir."

export const COMPUTER_UNITY_BRIDGE_GENERATION_TEXT = " Geração: "

export const COMPUTER_UNITY_BRIDGE_DESKTOP_TEXT = " Desktop: "

export const COMPUTER_UNITY_BRIDGE_DESKTOP_SEPARATOR = ", "

export const COMPUTER_UNITY_BRIDGE_DESKTOP_END = "."

export const COMPUTER_UNITY_BRIDGE_CURSOR_MOVED_TEXT = "cursor movido"

export const COMPUTER_UNITY_BRIDGE_CURSOR_STILL_TEXT = "cursor inalterado"

export const COMPUTER_UNITY_BRIDGE_FOREGROUND_CHANGED_TEXT = "foreground mudou"

export const COMPUTER_UNITY_BRIDGE_FOREGROUND_STILL_TEXT = "foreground inalterado"

export const COMPUTER_UNITY_BRIDGE_TEXT_VALUE_TEXT = " Valor depois: "

export const COMPUTER_UNITY_BRIDGE_TEXT_LENGTH_TEXT = " Comprimento: "

export const COMPUTER_UNITY_BRIDGE_STEPS_TEXT = " Passos: "

export const COMPUTER_UNITY_BRIDGE_KEY_TEXT = " Tecla: "

export const COMPUTER_UNITY_BRIDGE_SCROLL_BEFORE_TEXT = " Posição antes: ("

export const COMPUTER_UNITY_BRIDGE_SCROLL_AFTER_TEXT = " Posição depois: ("

export const COMPUTER_UNITY_BRIDGE_SCROLL_PATH_TEXT = " Lista: "

export const COMPUTER_UNITY_BRIDGE_MOVED_TEXT = " Moveu: "

export const COMPUTER_UNITY_BRIDGE_TRUNCATED_TEXT = " Truncado: "

export const COMPUTER_UNITY_BRIDGE_UNAVAILABLE_TEXT = "Rota unity-bridge indisponível: "

export const COMPUTER_UNITY_BRIDGE_APP_TEXT = "o aplicativo (pid "

export const COMPUTER_UNITY_BRIDGE_WINDOW_TEXT = ", janela "

export const COMPUTER_UNITY_BRIDGE_APP_END_TEXT = ") "

export const COMPUTER_UNITY_BRIDGE_NO_BRIDGE_TEXT =
  "é um aplicativo Unity, que não recebe entrada do driver nativo, e a bridge Unity não está ativa. Nada foi enviado ao aplicativo e nenhuma entrada em primeiro plano será usada."

export const COMPUTER_UNITY_BRIDGE_ATTACH_DETAIL_TEXT = " Anexo da bridge: "

export const COMPUTER_UNITY_BRIDGE_ATTACH_UNCONFIGURED_TEXT =
  "nenhum comando de anexo está configurado no computer-use-unity-bridge.json."

export const COMPUTER_UNITY_BRIDGE_ATTACH_INCOMPLETE_TEXT =
  "o comando de anexo foi executado, mas a bridge não publicou um handshake válido."

export const COMPUTER_UNITY_BRIDGE_ATTACH_FAILED_TEXT = "o comando de anexo falhou: "

export const COMPUTER_UNITY_BRIDGE_REFUSED_TEXT = "a bridge recusou a operação e nada foi executado. Motivo: "

export const COMPUTER_UNITY_BRIDGE_UNKNOWN_TEXT =
  "resultado desconhecido depois do envio; não repita sem verificar o estado. Motivo: "

export const COMPUTER_UNITY_BRIDGE_ERROR_TEXT = "a bridge não executou a operação. Motivo: "

export const COMPUTER_UNITY_BRIDGE_REASON_ABSENT = "não informado"

export const COMPUTER_UNITY_BRIDGE_MODIFIERS_TEXT =
  "Rota unity-bridge: modificadores (ctrl/shift/alt) não são suportados em alvos Unity; nada foi executado."

export const COMPUTER_UNITY_BRIDGE_UNSUPPORTED_TEXT =
  "Rota unity-bridge: esta entrada não é suportada pela bridge para esta janela; nada foi executado e nenhuma entrada em primeiro plano será usada."

export const COMPUTER_UNITY_BRIDGE_PROTOCOL_V1_TEXT =
  "Rota unity-bridge: a bridge carregada é a versão 1 (protocol 1) e esta operação não é suportada; nada foi executado."

export const COMPUTER_UNITY_BRIDGE_NOT_POINTER_TEXT =
  "Rota unity-bridge: esta ação exige o índice de um elemento Unity da última captura ou coordenadas completas; nada foi executado."

export const COMPUTER_UNITY_BRIDGE_HOTKEY_TEXT =
  "Rota unity-bridge: combinações e modificadores não são suportados; use uma tecla isolada (Return, Escape, Tab, setas). Nada foi executado."

export const COMPUTER_UNITY_BRIDGE_KEY_UNSUPPORTED_TEXT =
  "Rota unity-bridge: a bridge aceita somente Return, Escape, Tab e setas isoladas; nada foi executado."

export const COMPUTER_UNITY_BRIDGE_TEXT_TOO_LONG_TEXT =
  "Rota unity-bridge: o texto excede o limite aceito pela bridge; nada foi executado."

export const COMPUTER_UNITY_BRIDGE_SCROLL_INVALID_TEXT =
  "Rota unity-bridge: direção de rolagem inválida; nada foi executado."

export const COMPUTER_UNITY_BRIDGE_MIXED_DRAG_TEXT =
  "Rota unity-bridge: o arrasto precisa usar as duas pontas como elementos da captura ou as duas como coordenadas; nada foi executado."

export const COMPUTER_UNITY_BRIDGE_SET_VALUE_TEXT =
  "Rota unity-bridge: set_value não é suportado em elementos UGUI; use clique no elemento e type. Nada foi executado."

export const COMPUTER_UNITY_BRIDGE_STALE_GENERATION_TEXT =
  "Rota unity-bridge: a interface mudou desde a última captura (geração da bridge diferente); capture novamente antes de usar o índice. Nada foi executado."

export const COMPUTER_UNITY_BRIDGE_UNKNOWN_ACTION_STATUS_TEXT =
  "Rota unity-bridge: a bridge respondeu com status inesperado; capture o estado antes de repetir."

export const COMPUTER_UNITY_BRIDGE_NO_CAPTURE_TEXT =
  "Rota unity-bridge: não há captura desta janela com a geometria da bridge; capture antes de clicar por coordenada. Nada foi executado."

export const COMPUTER_UNITY_BRIDGE_STALE_CAPTURE_TEXT =
  "Rota unity-bridge: a janela ou a sessão da bridge mudou desde a última captura; capture novamente antes de clicar por coordenada. Nada foi executado."

export const COMPUTER_UNITY_BRIDGE_GEOMETRY_TEXT =
  "Rota unity-bridge: a geometria da captura não permite converter o pixel em coordenada da área cliente da janela; capture novamente. Nada foi executado."

export const COMPUTER_UNITY_BRIDGE_OUTSIDE_TEXT =
  "Rota unity-bridge: o pixel está fora da área cliente da janela; nada foi executado. Ponto no cliente: ("

export const COMPUTER_UNITY_BRIDGE_INVALID_RESPONSE_TEXT =
  "Rota unity-bridge: a bridge respondeu em formato inesperado depois do envio; não repita sem verificar o estado."

export const COMPUTER_UNITY_BRIDGE_TRANSPORT_UNKNOWN_TEXT =
  "Rota unity-bridge: o transporte falhou depois do envio; não repita sem verificar o estado."

export const COMPUTER_UNITY_BRIDGE_RESPONSE_TOO_LARGE_TEXT = "a bridge respondeu acima do limite aceito."

export const COMPUTER_UNITY_BRIDGE_CLOSED_TEXT = "a bridge encerrou a conexão antes da resposta."

export const COMPUTER_UNITY_BRIDGE_PROBE_UNITY = "probe-unity"

export const COMPUTER_UNITY_BRIDGE_PROBE_NOT_UNITY = "probe-not-unity"

export const COMPUTER_UNITY_BRIDGE_PROBE_UNKNOWN = "probe-unknown"

export const COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED = "attach-attempted"

export const COMPUTER_UNITY_BRIDGE_ATTACH_FAILED = "attach-failed"

export const COMPUTER_UNITY_BRIDGE_ATTACH_NOT_UNITY = "attach-not-unity"

export const COMPUTER_UNITY_BRIDGE_ATTACH_UNCONFIGURED = "attach-unconfigured"

export const COMPUTER_UNITY_BRIDGE_ATTACH_UNITY_ONLY = "attach-unity-without-command"

export const COMPUTER_UNITY_BRIDGE_ATTACH_INDETERMINATE = "attach-indeterminate"

export const COMPUTER_UNITY_BRIDGE_COMMAND_UNKNOWN_DETAIL = "o comando falhou sem detalhe."
