import { readIphoneFolderAppCount } from "#synapse/modules/iphone/internal/home-screen-layout"
import {
  IPHONE_ACCEPTED,
  IPHONE_HOME_PAGE_KNOWN,
  IPHONE_REFUSED,
  type IphoneHomeFolderResult,
  type IphoneHomeScreenPort,
  type IphoneHomeStateAccepted,
  type IphoneHomeStateResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_ALERT_FAILURE,
  IPHONE_HOME_FOLDER_CLOSE_FAILURE,
  IPHONE_HOME_FOLDER_CLOSE_POINT,
  IPHONE_HOME_FOLDER_COUNT_FAILURE,
  IPHONE_HOME_FOLDER_NEXT_POINT,
  IPHONE_HOME_FOLDER_OPEN_FAILURE,
  IPHONE_HOME_FOLDER_PAGE_LIMIT,
  IPHONE_HOME_FOLDER_PREVIOUS_POINT,
  IPHONE_HOME_ICON_MISSING,
  IPHONE_HOME_SETTLE_MS,
  IPHONE_HOME_SWIPE_LEFT,
  IPHONE_HOME_SWIPE_RIGHT,
} from "./constants"
import { readIphoneHomeScreen } from "./read"

export async function readIphoneHomeFolder(
  port: IphoneHomeScreenPort,
  name: string,
  signal: AbortSignal,
): Promise<IphoneHomeFolderResult> {
  const before = await readIphoneHomeScreen(port, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  if (before.alert || before.inFolder || before.edit) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ALERT_FAILURE }
  }
  const folders = before.layout.icons.filter((icon) => icon.folder && icon.name === name)
  const folder = folders[0]
  if (folders.length !== 1 || !folder) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
  }
  const count = readIphoneFolderAppCount(folder.badge)
  if (count.kind !== IPHONE_HOME_PAGE_KNOWN || count.count < 1) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_COUNT_FAILURE }
  }
  await port.tap(folder.point, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const after = await readIphoneHomeScreen(port, signal)
  if (after.kind === IPHONE_REFUSED) {
    return after
  }
  if (!after.inFolder || after.alert || after.edit) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_OPEN_FAILURE }
  }
  const result = await readIphoneFolderPages(port, after, count.count, signal)
  if (result.kind === IPHONE_REFUSED) {
    return result
  }
  return closeIphoneHomeFolder(port, result.names, before, signal)
}

async function closeIphoneHomeFolder(
  port: IphoneHomeScreenPort,
  names: string[],
  before: IphoneHomeStateAccepted,
  signal: AbortSignal,
): Promise<IphoneHomeFolderResult> {
  await port.tap(IPHONE_HOME_FOLDER_CLOSE_POINT, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const closed = await readIphoneHomeScreen(port, signal)
  if (closed.kind === IPHONE_REFUSED) {
    return closed
  }
  if (
    closed.inFolder ||
    closed.alert ||
    closed.page.kind !== before.page.kind ||
    (closed.page.kind === IPHONE_HOME_PAGE_KNOWN &&
      before.page.kind === IPHONE_HOME_PAGE_KNOWN &&
      closed.page.current !== before.page.current)
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_CLOSE_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED, names }
}

async function rewindIphoneFolder(
  port: IphoneHomeScreenPort,
  initial: IphoneHomeStateAccepted,
  signal: AbortSignal,
): Promise<IphoneHomeStateResult> {
  let state = initial
  for (let attempt = 0; attempt < IPHONE_HOME_FOLDER_PAGE_LIMIT; attempt++) {
    if (state.page.kind !== IPHONE_HOME_PAGE_KNOWN || state.page.current <= 1) {
      return state
    }
    const current = state.page.current
    await port.swipe(IPHONE_HOME_SWIPE_RIGHT, IPHONE_HOME_FOLDER_PREVIOUS_POINT, signal)
    await port.wait(IPHONE_HOME_SETTLE_MS, signal)
    const next = await readIphoneHomeScreen(port, signal)
    if (next.kind === IPHONE_REFUSED) {
      return next
    }
    if (
      !next.inFolder ||
      next.alert ||
      next.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
      next.page.current !== current - 1
    ) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_COUNT_FAILURE }
    }
    state = next
  }
  return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_COUNT_FAILURE }
}

async function readIphoneFolderPages(
  port: IphoneHomeScreenPort,
  initial: IphoneHomeStateAccepted,
  count: number,
  signal: AbortSignal,
): Promise<IphoneHomeFolderResult> {
  const rewind = await rewindIphoneFolder(port, initial, signal)
  if (rewind.kind === IPHONE_REFUSED) {
    return rewind
  }
  const names = new Set(rewind.layout.icons.map((icon) => icon.name))
  let state = rewind
  for (let attempt = 0; attempt < IPHONE_HOME_FOLDER_PAGE_LIMIT && names.size < count; attempt++) {
    if (state.page.kind !== IPHONE_HOME_PAGE_KNOWN) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_COUNT_FAILURE }
    }
    const current = state.page.current
    await port.swipe(IPHONE_HOME_SWIPE_LEFT, IPHONE_HOME_FOLDER_NEXT_POINT, signal)
    await port.wait(IPHONE_HOME_SETTLE_MS, signal)
    const next = await readIphoneHomeScreen(port, signal)
    if (next.kind === IPHONE_REFUSED) {
      return next
    }
    if (
      !next.inFolder ||
      next.alert ||
      next.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
      next.page.current !== current + 1
    ) {
      return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_COUNT_FAILURE }
    }
    for (const icon of next.layout.icons) {
      names.add(icon.name)
    }
    state = next
  }
  if (names.size !== count) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_FOLDER_COUNT_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED, names: Array.from(names).sort() }
}
