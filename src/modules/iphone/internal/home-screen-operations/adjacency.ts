import {
  buildIphoneHomeDrag,
  IPHONE_HOME_ADJACENT,
  IPHONE_HOME_GRID,
  type IphoneHomeMove,
  iphoneHomeSlotPoint,
  planIphoneHomeAdjacency,
} from "#synapse/modules/iphone/internal/home-screen-layout"
import {
  IPHONE_ACCEPTED,
  IPHONE_HOME_PAGE_KNOWN,
  IPHONE_REFUSED,
  type IphoneHomeScreenPort,
  type IphoneHomeStateAccepted,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_ADJACENCY_LIMIT,
  IPHONE_HOME_DROP_FAILURE,
  IPHONE_HOME_ICON_MISSING,
  IPHONE_HOME_SETTLE_MS,
} from "./constants"
import { editIphoneHomeScreen } from "./edit"
import { isIphoneCompactMoveValid } from "./predicates"
import { readIphoneHomeScreen } from "./read"

export async function moveIphoneHomeIcon(
  port: IphoneHomeScreenPort,
  state: IphoneHomeStateAccepted,
  plan: IphoneHomeMove,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const point = iphoneHomeSlotPoint(plan.row * IPHONE_HOME_GRID.columns.length + plan.column)
  if (point.kind === IPHONE_REFUSED) {
    return point
  }
  const drag = buildIphoneHomeDrag(plan.icon.point, point.point)
  if (drag.kind === IPHONE_REFUSED) {
    return drag
  }
  await port.actions(drag.actions, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const after = await readIphoneHomeScreen(port, signal)
  if (after.kind === IPHONE_REFUSED) {
    return after
  }
  if (
    state.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
    after.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
    state.page.current !== after.page.current ||
    after.alert ||
    after.inFolder ||
    !after.edit ||
    !isIphoneCompactMoveValid(
      state.layout.icons,
      after.layout.icons,
      plan.icon,
      plan.row * IPHONE_HOME_GRID.columns.length + plan.column,
    )
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}

export async function positionIphoneHomeAdjacent(
  port: IphoneHomeScreenPort,
  source: string,
  destination: string,
  folder: boolean,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  for (let attempt = 0; attempt < IPHONE_HOME_ADJACENCY_LIMIT; attempt++) {
    const editing = await editIphoneHomeScreen(port, signal)
    if (editing.kind === IPHONE_REFUSED) {
      return editing
    }
    const state = await readIphoneHomeScreen(port, signal)
    if (state.kind === IPHONE_REFUSED) {
      return state
    }
    const sources = state.layout.icons.filter((icon) => icon.name === source && !icon.folder)
    const destinations = state.layout.icons.filter((icon) => icon.name === destination && icon.folder === folder)
    const from = sources[0]
    const to = destinations[0]
    if (state.alert || state.inFolder || sources.length !== 1 || destinations.length !== 1 || !from || !to) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
    }
    const plan = planIphoneHomeAdjacency(state.layout, from, to)
    if (plan.kind === IPHONE_REFUSED) {
      return plan
    }
    if (plan.kind === IPHONE_HOME_ADJACENT) {
      return { kind: IPHONE_ACCEPTED }
    }
    const result = await moveIphoneHomeIcon(port, state, plan, signal)
    if (result.kind === IPHONE_REFUSED) {
      return result
    }
  }
  return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
}
