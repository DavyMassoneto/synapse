import { buildIphoneHomeDrag } from "#synapse/modules/iphone/internal/home-screen-layout"
import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneHomeScreenPort,
  type IphoneHomeStateAccepted,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import { positionIphoneHomeAdjacent } from "./adjacency"
import {
  IPHONE_HOME_DROP_FAILURE,
  IPHONE_HOME_ICON_MISSING,
  IPHONE_HOME_KEYBOARD_NAME_PATTERN,
  IPHONE_HOME_NAME_INVALID,
  IPHONE_HOME_SETTLE_MS,
} from "./constants"
import { editIphoneHomeScreen, exitIphoneHomeEdit } from "./edit"
import { readIphoneHomeFolder } from "./folder"
import { hasIphoneSameFolderContents } from "./predicates"
import { readIphoneHomeScreen } from "./read"
import { renameIphoneHomeFolder } from "./rename"

export async function createIphoneHomeFolder(
  port: IphoneHomeScreenPort,
  first: string,
  second: string,
  name: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  if (!IPHONE_HOME_KEYBOARD_NAME_PATTERN.test(name)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_NAME_INVALID }
  }
  const edit = await editIphoneHomeScreen(port, signal)
  if (edit.kind === IPHONE_REFUSED) {
    return edit
  }
  const before = await readIphoneHomeScreen(port, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  const adjacent = await positionIphoneHomeAdjacent(port, first, second, false, signal)
  if (adjacent.kind === IPHONE_REFUSED) {
    return adjacent
  }
  return createFromAdjacent(port, before, first, second, name, signal)
}

async function createFromAdjacent(
  port: IphoneHomeScreenPort,
  before: IphoneHomeStateAccepted,
  first: string,
  second: string,
  name: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  const left = state.layout.icons.filter((icon) => !icon.folder && icon.name === first)
  const right = state.layout.icons.filter((icon) => !icon.folder && icon.name === second)
  if (left.length !== 1 || right.length !== 1 || !left[0] || !right[0] || first === second) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
  }
  const drag = buildIphoneHomeDrag(left[0].point, right[0].point)
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
    after.alert ||
    after.inFolder ||
    after.layout.icons.some((icon) => !icon.folder && (icon.name === first || icon.name === second))
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  const created = after.layout.icons.filter(
    (icon) => icon.folder && !before.layout.icons.some((prior) => prior.folder && prior.name === icon.name),
  )
  if (created.length !== 1 || !created[0]) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return verifyAndRename(port, created[0].name, first, second, name, signal)
}

async function verifyAndRename(
  port: IphoneHomeScreenPort,
  autoName: string,
  first: string,
  second: string,
  name: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const exit = await exitIphoneHomeEdit(port, signal)
  if (exit.kind === IPHONE_REFUSED) {
    return exit
  }
  const contents = await readIphoneHomeFolder(port, autoName, signal)
  if (contents.kind === IPHONE_REFUSED) {
    return contents
  }
  if (!hasIphoneSameFolderContents(contents.names, [first, second])) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  const renamed = await renameIphoneHomeFolder(port, autoName, name, signal)
  if (renamed.kind === IPHONE_REFUSED) {
    return renamed
  }
  const verification = await readIphoneHomeFolder(port, name, signal)
  if (verification.kind === IPHONE_REFUSED) {
    return verification
  }
  if (!hasIphoneSameFolderContents(verification.names, [first, second])) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}
