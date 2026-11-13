import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneElement,
  type IphoneHomeIcon,
  type IphoneHomeLayoutResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_DIRECTION_MARKS,
  IPHONE_HOME_FOLDER_PREFIX,
  IPHONE_HOME_GRID,
  IPHONE_HOME_ICON_TYPE,
  IPHONE_HOME_VIEWPORT_REFUSAL,
  IPHONE_HOME_WIDGET_PATTERN,
} from "./constants"
import { iphoneHomeSlotPoint } from "./point"
import { type IphoneHomeInput } from "./types"

function iconColumn(x: number): number {
  let best = 0
  for (let column = 1; column < IPHONE_HOME_GRID.columns.length; column++) {
    const candidate = IPHONE_HOME_GRID.columns[column]
    const current = IPHONE_HOME_GRID.columns[best]
    if (
      typeof candidate === "number" &&
      typeof current === "number" &&
      Math.abs(candidate - x) < Math.abs(current - x)
    ) {
      best = column
    }
  }
  return best
}

function readIcon(element: IphoneElement): IphoneHomeIcon {
  const label = (element.label ? element.label : element.name).replace(IPHONE_HOME_DIRECTION_MARKS, "")
  const folder = label.startsWith(IPHONE_HOME_FOLDER_PREFIX)
  let name = label
  if (folder) {
    name = element.name && element.name !== element.label ? element.name : label.slice(IPHONE_HOME_FOLDER_PREFIX.length)
  }
  const x = Math.round(element.rect.x + element.rect.width / 2)
  const y = Math.round(element.rect.y + IPHONE_HOME_GRID.iconOffset)
  const column = iconColumn(x)
  const row = Math.max(
    0,
    Math.min(IPHONE_HOME_GRID.rows - 1, Math.round((y - IPHONE_HOME_GRID.rowStart) / IPHONE_HOME_GRID.rowSpacing)),
  )
  return {
    name: name.replace(IPHONE_HOME_DIRECTION_MARKS, ""),
    folder,
    badge: element.value,
    point: { x, y },
    column,
    row,
    slot: row * IPHONE_HOME_GRID.columns.length + column,
  }
}

function widgetSlots(element: IphoneElement): number[] {
  const slots: number[] = []
  for (let row = 0; row < IPHONE_HOME_GRID.rows; row++) {
    for (let column = 0; column < IPHONE_HOME_GRID.columns.length; column++) {
      const point = iphoneHomeSlotPoint(row * IPHONE_HOME_GRID.columns.length + column)
      if (
        point.kind === IPHONE_ACCEPTED &&
        point.point.x >= element.rect.x &&
        point.point.x <= element.rect.x + element.rect.width &&
        point.point.y >= element.rect.y &&
        point.point.y <= element.rect.y + element.rect.height
      ) {
        slots.push(row * IPHONE_HOME_GRID.columns.length + column)
      }
    }
  }
  return slots
}

function vacantIphoneSlots(icons: IphoneHomeIcon[], widgets: Set<number>): number[] {
  const occupied = new Set<number>(widgets)
  for (const icon of icons) {
    occupied.add(icon.slot)
  }
  const vacantSlots: number[] = []
  for (let slot = 0; slot < IPHONE_HOME_GRID.rows * IPHONE_HOME_GRID.columns.length; slot++) {
    if (!occupied.has(slot)) {
      vacantSlots.push(slot)
    }
  }
  return vacantSlots
}

export function readIphoneHomeLayout(input: IphoneHomeInput): IphoneHomeLayoutResult {
  if (input.viewport.x !== IPHONE_HOME_GRID.width || input.viewport.y !== IPHONE_HOME_GRID.height) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_VIEWPORT_REFUSAL }
  }
  const icons: IphoneHomeIcon[] = []
  const widgets = new Set<number>()
  for (const element of input.elements) {
    if (element.type !== IPHONE_HOME_ICON_TYPE || element.rect.y + element.rect.height / 2 >= IPHONE_HOME_GRID.dockY) {
      continue
    }
    if (IPHONE_HOME_WIDGET_PATTERN.test(element.value)) {
      for (const slot of widgetSlots(element)) {
        widgets.add(slot)
      }
    } else {
      icons.push(readIcon(element))
    }
  }
  return {
    kind: IPHONE_ACCEPTED,
    layout: {
      icons,
      widgetSlots: Array.from(widgets).sort((a, b) => a - b),
      vacantSlots: vacantIphoneSlots(icons, widgets),
    },
  }
}
