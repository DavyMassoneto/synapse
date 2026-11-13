import { IPHONE_ACCEPTED, IPHONE_REFUSED, type IphonePointResult } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_HOME_GRID, IPHONE_HOME_VIEWPORT_REFUSAL } from "./constants"

export function iphoneHomeSlotPoint(slot: number): IphonePointResult {
  const x = IPHONE_HOME_GRID.columns[slot % IPHONE_HOME_GRID.columns.length]
  const row = Math.floor(slot / IPHONE_HOME_GRID.columns.length)
  if (typeof x !== "number" || row < 0 || row >= IPHONE_HOME_GRID.rows || !Number.isInteger(slot)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_VIEWPORT_REFUSAL }
  }
  return {
    kind: IPHONE_ACCEPTED,
    point: { x, y: Math.round(IPHONE_HOME_GRID.rowStart + row * IPHONE_HOME_GRID.rowSpacing) },
  }
}
