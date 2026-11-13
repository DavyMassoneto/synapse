import { IPHONE_HOME_GRID, IPHONE_HOME_MOVE } from "#synapse/modules/iphone/internal/home-screen-layout"
import {
  IPHONE_ACCEPTED,
  IPHONE_HOME_PAGE_KNOWN,
  IPHONE_REFUSED,
  type IphoneHomeScreenPort,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import { moveIphoneHomeIcon } from "./adjacency"
import {
  IPHONE_HOME_ALERT_FAILURE,
  IPHONE_HOME_COMPACT_LIMIT,
  IPHONE_HOME_LAYOUT_CHANGED,
  IPHONE_HOME_WRONG_PAGE,
} from "./constants"
import { editIphoneHomeScreen } from "./edit"
import { gotoIphoneHomePage } from "./goto"
import { readIphoneHomeScreen } from "./read"

export async function compactIphoneHomePage(
  port: IphoneHomeScreenPort,
  page: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const navigation = await gotoIphoneHomePage(port, page, signal)
  if (navigation.kind === IPHONE_REFUSED) {
    return navigation
  }
  const edit = await editIphoneHomeScreen(port, signal)
  if (edit.kind === IPHONE_REFUSED) {
    return edit
  }
  return compactIphoneHomeEditingPage(port, page, signal)
}

async function compactIphoneHomeEditingPage(
  port: IphoneHomeScreenPort,
  page: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  for (let attempt = 0; attempt < IPHONE_HOME_COMPACT_LIMIT; attempt++) {
    const state = await readIphoneHomeScreen(port, signal)
    if (state.kind === IPHONE_REFUSED) {
      return state
    }
    if (state.alert) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ALERT_FAILURE }
    }
    if (!state.edit || state.page.kind !== IPHONE_HOME_PAGE_KNOWN || state.page.current !== page) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_WRONG_PAGE }
    }
    const last = state.layout.icons.reduce(
      (current, icon) => (!current || icon.slot > current.slot ? icon : current),
      state.layout.icons[0],
    )
    const gap = state.layout.vacantSlots[0]
    if (!last || typeof gap !== "number" || gap >= last.slot) {
      return { kind: IPHONE_ACCEPTED }
    }
    const result = await moveIphoneHomeIcon(
      port,
      state,
      {
        kind: IPHONE_HOME_MOVE,
        icon: last,
        column: gap % IPHONE_HOME_GRID.columns.length,
        row: Math.floor(gap / IPHONE_HOME_GRID.columns.length),
      },
      signal,
    )
    if (result.kind === IPHONE_REFUSED) {
      return result
    }
  }
  return { kind: IPHONE_REFUSED, message: IPHONE_HOME_LAYOUT_CHANGED }
}
