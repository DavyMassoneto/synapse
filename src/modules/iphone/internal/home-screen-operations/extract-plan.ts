import { IPHONE_HOME_GRID, readIphoneFolderAppCount } from "#synapse/modules/iphone/internal/home-screen-layout"
import {
  IPHONE_HOME_PAGE_KNOWN,
  IPHONE_REFUSED,
  type IphoneHomeStateAccepted,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_BOTTOM_ROW,
  IPHONE_HOME_DROP_FAILURE,
  IPHONE_HOME_EXTRACT_PLANNED,
  IPHONE_HOME_ICON_MISSING,
} from "./constants"
import { type IphoneHomeExtractPlan } from "./types"

export function planIphoneHomeExtract(before: IphoneHomeStateAccepted, folderName: string): IphoneHomeExtractPlan {
  const folders = before.layout.icons.filter((icon) => icon.folder && icon.name === folderName)
  const folder = folders[0]
  if (
    before.alert ||
    before.inFolder ||
    folders.length !== 1 ||
    !folder ||
    before.page.kind !== IPHONE_HOME_PAGE_KNOWN
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
  }
  const count = readIphoneFolderAppCount(folder.badge)
  const slot = before.layout.vacantSlots.findLast(
    (value) => Math.floor(value / IPHONE_HOME_GRID.columns.length) === IPHONE_HOME_BOTTOM_ROW,
  )
  if (count.kind !== IPHONE_HOME_PAGE_KNOWN || typeof slot !== "number") {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return { kind: IPHONE_HOME_EXTRACT_PLANNED, point: folder.point, slot, count: count.count, page: before.page.current }
}
