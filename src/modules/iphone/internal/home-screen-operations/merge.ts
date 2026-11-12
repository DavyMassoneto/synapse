import { buildIphoneHomeDrag } from "#synapse/modules/iphone/internal/home-screen-layout"
import { IPHONE_ACCEPTED, IPHONE_REFUSED, type IphoneSupportResult } from "#synapse/modules/iphone/public/contracts"
import { positionIphoneHomeAdjacent } from "./adjacency"
import { IPHONE_HOME_DROP_FAILURE, IPHONE_HOME_ICON_MISSING, IPHONE_HOME_SETTLE_MS } from "./constants"
import { editIphoneHomeScreen, exitIphoneHomeEdit } from "./edit"
import { readIphoneHomeFolder } from "./folder"
import { hasIphoneSameFolderContents } from "./predicates"
import { readIphoneHomeScreen } from "./read"
import { type IphoneHomeScreenPort } from "./types"

export async function mergeIphoneHomeFolder(
  port: IphoneHomeScreenPort,
  source: string,
  destination: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const before = await readIphoneHomeFolder(port, destination, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  const editing = await editIphoneHomeScreen(port, signal)
  if (editing.kind === IPHONE_REFUSED) {
    return editing
  }
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  if (state.inFolder) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  const positioned = await positionIphoneHomeAdjacent(port, source, destination, true, signal)
  if (positioned.kind === IPHONE_REFUSED) {
    return positioned
  }
  return dropIphoneHomeMerge(port, source, destination, before.names, signal)
}

async function dropIphoneHomeMerge(
  port: IphoneHomeScreenPort,
  source: string,
  destination: string,
  before: string[],
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const current = await readIphoneHomeScreen(port, signal)
  if (current.kind === IPHONE_REFUSED) {
    return current
  }
  const from = current.layout.icons.filter((icon) => !icon.folder && icon.name === source)
  const to = current.layout.icons.filter((icon) => icon.folder && icon.name === destination)
  if (from.length !== 1 || to.length !== 1 || !from[0] || !to[0]) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
  }
  const drag = buildIphoneHomeDrag(from[0].point, to[0].point)
  if (drag.kind === IPHONE_REFUSED) {
    return drag
  }
  await port.actions(drag.actions, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const after = await readIphoneHomeScreen(port, signal)
  if (after.kind === IPHONE_REFUSED) {
    return after
  }
  if (after.alert || after.inFolder || after.layout.icons.some((icon) => !icon.folder && icon.name === source)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  const exit = await exitIphoneHomeEdit(port, signal)
  if (exit.kind === IPHONE_REFUSED) {
    return exit
  }
  const contents = await readIphoneHomeFolder(port, destination, signal)
  if (contents.kind === IPHONE_REFUSED) {
    return contents
  }
  if (!hasIphoneSameFolderContents(contents.names, [...before, source])) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_DROP_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}
