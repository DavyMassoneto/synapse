import {
  IPHONE_HOME_DRAG_HOLD_MS,
  IPHONE_HOME_DRAG_LIFT_MS,
  IPHONE_HOME_DRAG_LIFT_POINTS,
  IPHONE_HOME_DRAG_MOVE_MS,
  IPHONE_HOME_PAGE_KNOWN,
  type IphoneHomeStateAccepted,
  iphoneHomeSlotPoint,
  readIphoneFolderAppCount,
} from "#synapse/modules/iphone/internal/home-screen-layout"
import { buildIphoneDrag, type IphoneGestureResult } from "#synapse/modules/iphone/internal/pointer-gestures"
import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphonePoint,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_DROP_FAILURE,
  IPHONE_HOME_EXTRACT_HOVER_MS,
  IPHONE_HOME_EXTRACT_OFFSET,
  IPHONE_HOME_FOLDER_OPEN_FAILURE,
  IPHONE_HOME_ICON_MISSING,
  IPHONE_HOME_SETTLE_MS,
} from "./constants"
import { editIphoneHomeScreen, exitIphoneHomeEdit } from "./edit"
import { planIphoneHomeExtract } from "./extract-plan"
import { findIphoneFolderPage } from "./find-folder-page"
import { readIphoneHomeScreen } from "./read"
import { type IphoneHomeScreenPort } from "./types"

export async function extractIphoneHomeApp(
  port: IphoneHomeScreenPort,
  folderName: string,
  appName: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const exit = await exitIphoneHomeEdit(port, signal)
  if (exit.kind === IPHONE_REFUSED) {
    return exit
  }
  const before = await readIphoneHomeScreen(port, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  const plan = planIphoneHomeExtract(before, folderName)
  if (plan.kind === IPHONE_REFUSED) {
    return plan
  }
  return openAndExtract(port, plan.point, folderName, appName, plan.slot, plan.count, plan.page, signal)
}

async function openAndExtract(
  port: IphoneHomeScreenPort,
  point: IphonePoint,
  folderName: string,
  appName: string,
  slot: number,
  count: number,
  page: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  await port.tap(point, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const opened = await readIphoneHomeScreen(port, signal)
  if (opened.kind === IPHONE_REFUSED) {
    return opened
  }
  if (!opened.inFolder || opened.edit || opened.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_OPEN_FAILURE }
  }
  const found = await findIphoneFolderPage(port, appName, signal)
  if (found.kind === IPHONE_REFUSED) {
    return found
  }
  const edit = await editIphoneHomeScreen(port, signal)
  if (edit.kind === IPHONE_REFUSED) {
    return edit
  }
  return extractEditingApp(port, folderName, appName, slot, count, page, signal)
}

async function extractEditingApp(
  port: IphoneHomeScreenPort,
  folderName: string,
  appName: string,
  slot: number,
  beforeCount: number,
  page: number,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  const apps = state.layout.icons.filter((icon) => !icon.folder && icon.name === appName)
  const app = apps[0]
  const point = iphoneHomeSlotPoint(slot)
  if (!state.inFolder || !state.edit || state.alert || apps.length !== 1 || !app || point.kind === IPHONE_REFUSED) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
  }
  const drag = buildExtractDrag(app.point, point.point)
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
    after.inFolder ||
    after.alert ||
    after.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
    after.page.current !== page ||
    !after.layout.icons.some((icon) => !icon.folder && icon.name === appName)
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return verifyExtractedFolder(after, folderName, beforeCount)
}

function verifyExtractedFolder(
  after: IphoneHomeStateAccepted,
  folderName: string,
  beforeCount: number,
): IphoneSupportResult {
  const folder = after.layout.icons.find((icon) => icon.folder && icon.name === folderName)
  if (!folder && beforeCount === 1) {
    return { kind: IPHONE_ACCEPTED }
  }
  if (!folder) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  const count = readIphoneFolderAppCount(folder.badge)
  if (count.kind !== IPHONE_HOME_PAGE_KNOWN || count.count !== beforeCount - 1) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}

function buildExtractDrag(point: IphonePoint, destination: IphonePoint): IphoneGestureResult {
  return buildIphoneDrag({
    from: point,
    destination: {
      x: destination.x,
      y: destination.y + IPHONE_HOME_EXTRACT_OFFSET,
    },
    holdMs: IPHONE_HOME_DRAG_HOLD_MS,
    hoverMs: IPHONE_HOME_EXTRACT_HOVER_MS,
    liftMs: IPHONE_HOME_DRAG_LIFT_MS,
    liftDistance: IPHONE_HOME_DRAG_LIFT_POINTS,
    moveMs: IPHONE_HOME_DRAG_MOVE_MS,
  })
}
