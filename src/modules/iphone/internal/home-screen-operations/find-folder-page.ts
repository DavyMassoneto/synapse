import { IPHONE_HOME_PAGE_KNOWN } from "#synapse/modules/iphone/internal/home-screen-layout"
import { IPHONE_ACCEPTED, IPHONE_REFUSED, type IphoneSupportResult } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_DROP_FAILURE,
  IPHONE_HOME_FOLDER_NEXT_POINT,
  IPHONE_HOME_FOLDER_OPEN_FAILURE,
  IPHONE_HOME_FOLDER_PAGE_LIMIT,
  IPHONE_HOME_ICON_MISSING,
  IPHONE_HOME_SETTLE_MS,
  IPHONE_HOME_SWIPE_LEFT,
} from "./constants"
import { readIphoneHomeScreen } from "./read"
import { type IphoneHomeScreenPort } from "./types"

export async function findIphoneFolderPage(
  port: IphoneHomeScreenPort,
  appName: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  for (let attempt = 0; attempt < IPHONE_HOME_FOLDER_PAGE_LIMIT; attempt++) {
    const state = await readIphoneHomeScreen(port, signal)
    if (state.kind === IPHONE_REFUSED) {
      return state
    }
    if (!state.inFolder || state.alert || state.edit) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_OPEN_FAILURE }
    }
    const matches = state.layout.icons.filter((icon) => !icon.folder && icon.name === appName)
    if (matches.length === 1) {
      return { kind: IPHONE_ACCEPTED }
    }
    if (matches.length > 1 || state.page.kind !== IPHONE_HOME_PAGE_KNOWN || state.page.current >= state.page.total) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
    }
    const moved = await moveIphoneFolderPage(port, state.page.current, signal)
    if (moved.kind === IPHONE_REFUSED) {
      return moved
    }
  }
  return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
}

async function moveIphoneFolderPage(
  port: IphoneHomeScreenPort,
  current: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  await port.swipe(IPHONE_HOME_SWIPE_LEFT, IPHONE_HOME_FOLDER_NEXT_POINT, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const next = await readIphoneHomeScreen(port, signal)
  if (next.kind === IPHONE_REFUSED) {
    return next
  }
  if (!next.inFolder || next.alert || next.page.kind !== IPHONE_HOME_PAGE_KNOWN || next.page.current !== current + 1) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}
