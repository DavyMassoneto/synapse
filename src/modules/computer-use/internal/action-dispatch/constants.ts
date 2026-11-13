import { type ComputerClickSpecifications } from "./types"
export const COMPUTER_DISPATCH_LIST_WINDOWS = "list_windows"

export const COMPUTER_DISPATCH_LIST_APPS = "list_apps"

export const COMPUTER_DISPATCH_WINDOW_STATE = "get_window_state"

export const COMPUTER_DISPATCH_SCREENSHOT = "screenshot"

export const COMPUTER_DISPATCH_DESKTOP_STATE = "get_desktop_state"

export const COMPUTER_DISPATCH_TYPE_TEXT = "type_text"

export const COMPUTER_DISPATCH_PRESS_KEY = "press_key"

export const COMPUTER_DISPATCH_HOTKEY = "hotkey"

export const COMPUTER_DISPATCH_SET_VALUE = "set_value"

export const COMPUTER_DISPATCH_NO_TARGET = "Capture ou selecione uma janela antes da entrada."

export const COMPUTER_DISPATCH_BAD_POINTER = "A ação exige índice de elemento ou coordenadas completas."

export const COMPUTER_DISPATCH_BAD_KEY = "A combinação não contém uma tecla."

export const COMPUTER_DISPATCH_UNSUPPORTED_FOREGROUND = "O driver não anuncia entrega em primeiro plano."

export const COMPUTER_DISPATCH_UNSUPPORTED_FOCUS = "O driver não anuncia a ferramenta de trazer a janela à frente."

export const COMPUTER_DISPATCH_MAX_ELEMENTS = 200

export const COMPUTER_DISPATCH_JPEG_FORMAT = "jpeg"

export const COMPUTER_DISPATCH_JPEG_QUALITY = 85

export const COMPUTER_DISPATCH_SCROLL_AMOUNT = 3

export const COMPUTER_DISPATCH_SCROLL_MAX = 50

export const COMPUTER_DISPATCH_SCROLL_MIN = 1

export const COMPUTER_DISPATCH_WAIT_SECONDS = 1

export const COMPUTER_DISPATCH_WAIT_MAX_SECONDS = 30

export const COMPUTER_DISPATCH_MILLISECONDS_PER_SECOND = 1000

export const COMPUTER_DISPATCH_LEFT_BUTTON = "left"

export const COMPUTER_DISPATCH_RIGHT_BUTTON = "right"

export const COMPUTER_DISPATCH_MIDDLE_BUTTON = "middle"

export const COMPUTER_DISPATCH_DOWN_DIRECTION = "down"

export const COMPUTER_DISPATCH_DESKTOP_SCOPE = "desktop"

export const COMPUTER_DISPATCH_WAIT_MESSAGE = "Espera concluída."

export const COMPUTER_DISPATCH_FOCUS_MESSAGE = "Alvo selecionado sem alterar o foco."

export const COMPUTER_DISPATCH_REFUSED_VERDICT = "stop"

export const COMPUTER_DISPATCH_SECONDS_PROPERTY = "seconds"

export const COMPUTER_DISPATCH_DELIVERY_PROPERTY = "deliveryMode"

export const COMPUTER_DISPATCH_DRIVER_DELIVERY_PROPERTY = "delivery_mode"

export const COMPUTER_DISPATCH_TOKEN_PROPERTY = "element_token"

export const COMPUTER_DISPATCH_BRING_PROPERTY = "bringToFront"

export const COMPUTER_DISPATCH_PID_PROPERTY = "pid"

export const COMPUTER_DISPATCH_WINDOW_PROPERTY = "windowId"

export const COMPUTER_DISPATCH_ELEMENT_PROPERTY = "element"

export const COMPUTER_DISPATCH_FROM_PROPERTY = "fromElement"

export const COMPUTER_DISPATCH_TO_PROPERTY = "toElement"

export const COMPUTER_DISPATCH_AMOUNT_PROPERTY = "amount"

export const COMPUTER_DISPATCH_SCREEN_APP = "screen"

export const COMPUTER_DISPATCH_VERIFIED_PROPERTY = "verified"

export const COMPUTER_DISPATCH_DELIVERED_PROPERTY = "deliveredChars"

export const COMPUTER_DISPATCH_REQUESTED_PROPERTY = "requestedChars"

export const COMPUTER_DISPATCH_UNKNOWN_FAILURE = "Falha inesperada ao executar a ação no computador."

export const COMPUTER_FOCUS_UNNEEDED = "focus-unneeded"

export const COMPUTER_PREPARED_TARGET_ELEMENT = "prepared-target-element"

export const COMPUTER_PREPARED_TARGET_COORDINATE = "prepared-target-coordinate"

export const COMPUTER_PREPARED_TARGET_ABSENT = "prepared-target-absent"

export const COMPUTER_CLICK_DYNAMIC_BUTTON = "dynamic-button"

export const COMPUTER_CLICK_FORCED_BUTTON = "forced-button"

export const COMPUTER_CLICK_SPECIFICATIONS: ComputerClickSpecifications = {
  click: { kind: COMPUTER_CLICK_DYNAMIC_BUTTON, tool: "click", button: COMPUTER_DISPATCH_LEFT_BUTTON },
  double_click: { kind: COMPUTER_CLICK_DYNAMIC_BUTTON, tool: "double_click", button: COMPUTER_DISPATCH_LEFT_BUTTON },
  right_click: { kind: COMPUTER_CLICK_FORCED_BUTTON, tool: "click", button: COMPUTER_DISPATCH_RIGHT_BUTTON },
  middle_click: { kind: COMPUTER_CLICK_FORCED_BUTTON, tool: "click", button: COMPUTER_DISPATCH_MIDDLE_BUTTON },
}
