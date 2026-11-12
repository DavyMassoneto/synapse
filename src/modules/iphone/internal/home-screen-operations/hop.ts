import {
  buildIphoneHomePageDrag,
  IPHONE_HOME_PAGE_KNOWN,
  type IphoneHomeIcon,
  type IphoneHomeStateAccepted,
  iphoneHomeSlotPoint,
  isIphoneHomePathBlocked,
} from "#synapse/modules/iphone/internal/home-screen-layout"
import { IPHONE_EDGE_RIGHT } from "#synapse/modules/iphone/internal/pointer-gestures"
import { IPHONE_ACCEPTED, IPHONE_REFUSED, type IphoneSupportResult } from "#synapse/modules/iphone/public/contracts"
import { snapshotIphoneCascade, verifyIphoneCascade } from "./cascade"
import {
  IPHONE_HOME_DROP_FAILURE,
  IPHONE_HOME_ICON_MISSING,
  IPHONE_HOME_LAYOUT_CHANGED,
  IPHONE_HOME_SETTLE_MS,
  IPHONE_HOME_SWIPE_LEFT,
} from "./constants"
import { editIphoneHomeScreen } from "./edit"
import { gotoIphoneHomePage } from "./goto"
import { readIphoneHomeScreen } from "./read"
import { type IphoneHomeHopRequest, type IphoneHomeScreenPort } from "./types"

export async function hopIphoneHomeIcon(
  port: IphoneHomeScreenPort,
  request: IphoneHomeHopRequest,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const { from, to } = request
  if (Math.abs(from - to) !== 1) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  const destination = await gotoIphoneHomePage(port, to, signal)
  if (destination.kind === IPHONE_REFUSED) {
    return destination
  }
  const before = await readIphoneHomeScreen(port, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  let last = -1
  for (const icon of before.layout.icons) {
    last = Math.max(last, icon.slot)
  }
  for (const widget of before.layout.widgetSlots) {
    last = Math.max(last, widget)
  }
  const slot = before.layout.vacantSlots.find((candidate) => candidate > last)
  if (typeof slot !== "number") {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  const cascade = await snapshotIphoneCascade(port, request, signal)
  if (cascade.kind === IPHONE_REFUSED) {
    return cascade
  }
  const hop = await performIphoneHomeHop(port, request, before, slot, signal)
  const verified = await verifyIphoneCascade(port, cascade, request.to, signal)
  if (verified.kind === IPHONE_REFUSED) {
    return verified
  }
  return hop
}

async function performIphoneHomeHop(
  port: IphoneHomeScreenPort,
  request: IphoneHomeHopRequest,
  before: IphoneHomeStateAccepted,
  slot: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const { name, folder, from } = request
  const source = await gotoIphoneHomePage(port, from, signal)
  if (source.kind === IPHONE_REFUSED) {
    return source
  }
  const edit = await editIphoneHomeScreen(port, signal)
  if (edit.kind === IPHONE_REFUSED) {
    return edit
  }
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  const matches = state.layout.icons.filter((icon) => icon.name === name && icon.folder === folder)
  const icon = matches[0]
  if (matches.length !== 1 || !icon) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
  }
  return dragIphoneHomeHop(port, request, before, state, icon, slot, signal)
}

async function dragIphoneHomeHop(
  port: IphoneHomeScreenPort,
  request: IphoneHomeHopRequest,
  before: IphoneHomeStateAccepted,
  state: IphoneHomeStateAccepted,
  icon: IphoneHomeIcon,
  slot: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const { from, to } = request
  const edge = to > from ? IPHONE_EDGE_RIGHT : IPHONE_HOME_SWIPE_LEFT
  if (isIphoneHomePathBlocked(state.layout, icon, edge)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_LAYOUT_CHANGED }
  }
  const point = iphoneHomeSlotPoint(slot)
  if (point.kind === IPHONE_REFUSED) {
    return point
  }
  const drag = buildIphoneHomePageDrag(icon.point, point.point, edge)
  if (drag.kind === IPHONE_REFUSED) {
    return drag
  }
  await port.actions(drag.actions, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  return verifyIphoneHomeHop(port, request, before, signal)
}

async function verifyIphoneHomeHop(
  port: IphoneHomeScreenPort,
  request: IphoneHomeHopRequest,
  before: IphoneHomeStateAccepted,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const { name, folder, to } = request
  const after = await readIphoneHomeScreen(port, signal)
  if (after.kind === IPHONE_REFUSED) {
    return after
  }
  if (
    after.alert ||
    after.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
    after.page.current !== to ||
    after.layout.icons.length !== before.layout.icons.length + 1 ||
    before.layout.icons.some(
      (original) =>
        !after.layout.icons.some(
          (candidate) => candidate.name === original.name && candidate.folder === original.folder,
        ),
    ) ||
    !after.layout.icons.some((candidate) => candidate.name === name && candidate.folder === folder)
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}
