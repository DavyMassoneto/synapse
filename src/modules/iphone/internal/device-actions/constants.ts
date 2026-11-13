import { type IphoneApplicationScripts, type IphoneOppositeDirections } from "./types"

export const IPHONE_ACTION_SCROLL_SCRIPT = "scroll"

export const IPHONE_ACTION_TAP_DURATION_MS = 0

export const IPHONE_ACTION_TAPPED = "Toque enviado."

export const IPHONE_ACTION_INVALID = "Argumentos inválidos para a ação do iPhone."

export const IPHONE_ACTION_SENT = "Ação enviada."

export const IPHONE_ACTION_UNSUPPORTED = "unsupported operation"

export const IPHONE_ACTION_UNKNOWN_COMMAND = "unknown command"

export const IPHONE_ACTION_KEYS = "keys"

export const IPHONE_ACTION_DOUBLE_TAP_SCRIPT = "doubleTap"

export const IPHONE_ACTION_DRAG_SCRIPT = "dragFromToForDuration"

export const IPHONE_ACTION_LAUNCH_SCRIPT = "launchApp"

export const IPHONE_ACTION_ACTIVATE_SCRIPT = "activateApp"

export const IPHONE_ACTION_TERMINATE_SCRIPT = "terminateApp"

export const IPHONE_APPLICATION_SCRIPTS: IphoneApplicationScripts = {
  launch: IPHONE_ACTION_LAUNCH_SCRIPT,
  terminate: IPHONE_ACTION_TERMINATE_SCRIPT,
  activate: IPHONE_ACTION_ACTIVATE_SCRIPT,
}

export const IPHONE_ACTION_INSTALL_SCRIPT = "installApp"

export const IPHONE_ACTION_PRESS_SCRIPT = "pressButton"

export const IPHONE_ACTION_LINK_SCRIPT = "deepLink"

export const IPHONE_ACTION_DEVICE_INFO = "deviceInfo"

export const IPHONE_ACTION_APP_INFO = "activeAppInfo"

export const IPHONE_ACTION_RETURN = "\n"

export const IPHONE_ACTION_FOCUS_WAIT_MS = 400

export const IPHONE_ACTION_MS_PER_SECOND = 1000

export const IPHONE_ACTION_MAX_WAIT_SECONDS = 30

export const IPHONE_ACTION_SWIPE_FRACTION = 0.3

export const IPHONE_ACTION_SWIPE_SECONDS = 0.3

export const IPHONE_ACTION_TARGET_MISSING = "Alvo ausente na última árvore; leia a tela novamente."

export const IPHONE_ACTION_OPPOSITE_DIRECTIONS: IphoneOppositeDirections = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
}

export const IPHONE_ACTION_UP = "up"

export const IPHONE_ACTION_DOWN = "down"

export const IPHONE_ACTION_LEFT = "left"

export const IPHONE_ACTION_RIGHT = "right"
