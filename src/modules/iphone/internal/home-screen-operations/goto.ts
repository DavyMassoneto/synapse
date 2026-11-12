import {
  IPHONE_HOME_PAGE_KNOWN,
  type IphoneHomeStateAccepted,
} from "#synapse/modules/iphone/internal/home-screen-layout"
import { IPHONE_ACCEPTED, IPHONE_REFUSED, type IphoneSupportResult } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_ALERT_FAILURE,
  IPHONE_HOME_FOLDER_FAILURE,
  IPHONE_HOME_PAGE_FAILURE,
  IPHONE_HOME_PAGE_UNCHANGED,
  IPHONE_HOME_SETTLE_MS,
  IPHONE_HOME_SWIPE_LEFT,
  IPHONE_HOME_SWIPE_POINT,
  IPHONE_HOME_SWIPE_RIGHT,
} from "./constants"
import { readIphoneHomeScreen } from "./read"
import { type IphoneHomeScreenPort } from "./types"

export async function gotoIphoneHomePage(
  port: IphoneHomeScreenPort,
  page: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  if (state.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ALERT_FAILURE }
  }
  if (state.inFolder) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_FAILURE }
  }
  if (
    state.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > state.page.total - (state.edit && state.page.total > 1 ? 1 : 0)
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_PAGE_FAILURE }
  }
  return navigateIphoneHomePages(port, page, state, signal)
}

async function navigateIphoneHomePages(
  port: IphoneHomeScreenPort,
  page: number,
  initial: IphoneHomeStateAccepted,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  let state = initial
  while (state.page.kind === IPHONE_HOME_PAGE_KNOWN && state.page.current !== page) {
    const current = state.page.current
    const direction = current < page ? IPHONE_HOME_SWIPE_LEFT : IPHONE_HOME_SWIPE_RIGHT
    await port.swipe(direction, IPHONE_HOME_SWIPE_POINT, signal)
    await port.wait(IPHONE_HOME_SETTLE_MS, signal)
    const next = await readIphoneHomeScreen(port, signal)
    if (next.kind === IPHONE_REFUSED) {
      return next
    }
    state = next
    if (
      state.alert ||
      state.inFolder ||
      state.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
      state.page.current !== current + (direction === IPHONE_HOME_SWIPE_LEFT ? 1 : -1)
    ) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_PAGE_UNCHANGED }
    }
  }
  return { kind: IPHONE_ACCEPTED }
}
