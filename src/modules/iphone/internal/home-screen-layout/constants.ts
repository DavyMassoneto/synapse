import { type IphoneHomeGrid } from "./types"

export const IPHONE_HOME_ROW_START_POINTS = 126

export const IPHONE_HOME_ROW_SPACING_POINTS = 108.6

export const IPHONE_HOME_ICON_OFFSET_POINTS = 34

export const IPHONE_HOME_DOCK_Y_POINTS = 800

export const IPHONE_HOME_COLUMN_1 = 69
export const IPHONE_HOME_COLUMN_2 = 170
export const IPHONE_HOME_COLUMN_3 = 271
export const IPHONE_HOME_COLUMN_4 = 371

export const IPHONE_HOME_DRAG_HOLD_MS = 500

export const IPHONE_HOME_DRAG_LIFT_POINTS = 14

export const IPHONE_HOME_DRAG_LIFT_MS = 250

export const IPHONE_HOME_DRAG_MOVE_MS = 30

export const IPHONE_HOME_DRAG_HOVER_MS = 500

export const IPHONE_HOME_FLIP_WAIT_MS = 850

export const IPHONE_HOME_GRID: IphoneHomeGrid = {
  width: 440,
  height: 956,
  columns: [IPHONE_HOME_COLUMN_1, IPHONE_HOME_COLUMN_2, IPHONE_HOME_COLUMN_3, IPHONE_HOME_COLUMN_4],
  rows: 6,
  rowStart: IPHONE_HOME_ROW_START_POINTS,
  rowSpacing: IPHONE_HOME_ROW_SPACING_POINTS,
  iconOffset: IPHONE_HOME_ICON_OFFSET_POINTS,
  dockY: IPHONE_HOME_DOCK_Y_POINTS,
}

export const IPHONE_HOME_FOLDER_PREFIX = "pasta "
export const IPHONE_HOME_PAGE_PATTERN = /Página (\d+) de (\d+)/
export const IPHONE_HOME_FOLDER_NAME = "Nome da pasta"
export const IPHONE_HOME_CLEAR_TEXT = "Limpar texto"
export const IPHONE_HOME_APP_COUNT_PATTERN = /(\d+) apps?/
export const IPHONE_HOME_WIDGET_PATTERN = /Widget/
export const IPHONE_HOME_DIRECTION_MARKS = /[\u200e\u200f\u202a-\u202e]/g
export const IPHONE_HOME_VIEWPORT_REFUSAL = "A tela inicial só está calibrada para 440x956 pontos."
export const IPHONE_HOME_FULL = "A página está cheia."
export const IPHONE_HOME_MOVE = "move"
export const IPHONE_HOME_ADJACENT = "adjacent"

export const IPHONE_HOME_WIDGET_OCCUPIED = "A posição está ocupada por um widget."

export const IPHONE_HOME_SLOT_OCCUPIED = "A posição está ocupada."

export const IPHONE_HOME_SLOT_INVALID = "A posição não pertence à grade."

export { IPHONE_HOME_PAGE_KNOWN, IPHONE_HOME_PAGE_MISSING } from "#synapse/modules/iphone/public/contracts"

export const IPHONE_HOME_BUTTON = "Button"

export const IPHONE_HOME_OK = "OK"

export const IPHONE_HOME_DELETE_BUTTON = "DeleteButton"

export const IPHONE_HOME_ALERT = "Alert"

export const IPHONE_HOME_TEXT_FIELD = "TextField"

export const IPHONE_HOME_PAGE_INDICATOR = "PageIndicator"

export const IPHONE_HOME_OK_MIN_X = 300

export const IPHONE_HOME_OK_MAX_Y = 60
export const IPHONE_HOME_ICON_TYPE = "Icon"
