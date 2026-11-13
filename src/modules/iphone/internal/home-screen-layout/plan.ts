import { IPHONE_REFUSED, type IphoneHomeIcon, type IphoneHomeLayout } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_ADJACENT,
  IPHONE_HOME_FULL,
  IPHONE_HOME_GRID,
  IPHONE_HOME_MOVE,
  IPHONE_HOME_SLOT_INVALID,
  IPHONE_HOME_SLOT_OCCUPIED,
  IPHONE_HOME_WIDGET_OCCUPIED,
} from "./constants"
import { type IphoneHomePlan } from "./types"

export function planIphoneHomeMove(
  layout: IphoneHomeLayout,
  icon: IphoneHomeIcon,
  column: number,
  row: number,
): IphoneHomePlan {
  if (
    !Number.isInteger(column) ||
    !Number.isInteger(row) ||
    column < 0 ||
    column >= IPHONE_HOME_GRID.columns.length ||
    row < 0 ||
    row >= IPHONE_HOME_GRID.rows
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_SLOT_INVALID }
  }
  const slot = row * IPHONE_HOME_GRID.columns.length + column
  if (layout.widgetSlots.includes(slot)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_WIDGET_OCCUPIED }
  }
  if (!layout.vacantSlots.includes(slot)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_SLOT_OCCUPIED }
  }
  return { kind: IPHONE_HOME_MOVE, icon, column, row }
}

export function planIphoneHomeMoveToEnd(layout: IphoneHomeLayout, icon: IphoneHomeIcon): IphoneHomePlan {
  let last = -1
  for (const slot of layout.widgetSlots) {
    last = Math.max(last, slot)
  }
  for (const other of layout.icons) {
    if (other !== icon) {
      last = Math.max(last, other.slot)
    }
  }
  const slot = last + 1
  if (slot >= IPHONE_HOME_GRID.rows * IPHONE_HOME_GRID.columns.length) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FULL }
  }
  return {
    kind: IPHONE_HOME_MOVE,
    icon,
    column: slot % IPHONE_HOME_GRID.columns.length,
    row: Math.floor(slot / IPHONE_HOME_GRID.columns.length),
  }
}

export function planIphoneHomeAdjacency(
  layout: IphoneHomeLayout,
  source: IphoneHomeIcon,
  destination: IphoneHomeIcon,
): IphoneHomePlan {
  if (source.row === destination.row && Math.abs(source.column - destination.column) === 1) {
    return { kind: IPHONE_HOME_ADJACENT }
  }
  let last = -1
  for (const icon of layout.icons) {
    last = Math.max(last, icon.slot)
  }
  const mover = source.slot === last ? source : destination
  const anchor = mover === source ? destination : source
  if (mover.slot === last) {
    for (const column of [anchor.column - 1, anchor.column + 1]) {
      const slot = anchor.row * IPHONE_HOME_GRID.columns.length + column
      if (column >= 0 && column < IPHONE_HOME_GRID.columns.length && layout.vacantSlots.includes(slot)) {
        return { kind: IPHONE_HOME_MOVE, icon: mover, column, row: anchor.row }
      }
    }
  }
  if (destination.slot === last) {
    return planIphoneHomeMoveToEnd(layout, source)
  }
  return planIphoneHomeMoveToEnd(layout, destination)
}
