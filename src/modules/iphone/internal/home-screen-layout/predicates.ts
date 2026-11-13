import { IPHONE_EDGE_RIGHT, type IphoneEdge } from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  type IphoneElement,
  type IphoneHomeIcon,
  type IphoneHomeLayout,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_BUTTON,
  IPHONE_HOME_CLEAR_TEXT,
  IPHONE_HOME_DELETE_BUTTON,
  IPHONE_HOME_GRID,
  IPHONE_HOME_OK,
  IPHONE_HOME_OK_MAX_Y,
  IPHONE_HOME_OK_MIN_X,
} from "./constants"

export function isIphoneHomeEditButton(element: IphoneElement): boolean {
  return (
    (element.label === IPHONE_HOME_OK &&
      element.rect.x >= IPHONE_HOME_OK_MIN_X &&
      element.rect.y < IPHONE_HOME_OK_MAX_Y) ||
    element.name === IPHONE_HOME_DELETE_BUTTON
  )
}

export function isIphoneHomeClearButton(element: IphoneElement): boolean {
  return (
    element.type === IPHONE_HOME_BUTTON &&
    (element.name === IPHONE_HOME_CLEAR_TEXT || element.label === IPHONE_HOME_CLEAR_TEXT)
  )
}

export function isIphoneHomePathBlocked(layout: IphoneHomeLayout, icon: IphoneHomeIcon, edge: IphoneEdge): boolean {
  return layout.widgetSlots.some(
    (slot) =>
      Math.floor(slot / IPHONE_HOME_GRID.columns.length) === icon.row &&
      (edge === IPHONE_EDGE_RIGHT
        ? slot % IPHONE_HOME_GRID.columns.length > icon.column
        : slot % IPHONE_HOME_GRID.columns.length < icon.column),
  )
}
