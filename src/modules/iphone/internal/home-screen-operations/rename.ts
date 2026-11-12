import {
  IPHONE_HOME_FOLDER_NAME,
  IPHONE_HOME_TEXT_FIELD,
  isIphoneHomeClearButton,
} from "#synapse/modules/iphone/internal/home-screen-layout"
import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneElement,
  type IphonePoint,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_FOLDER_CLOSE_POINT,
  IPHONE_HOME_ICON_MISSING,
  IPHONE_HOME_KEYBOARD_NAME_PATTERN,
  IPHONE_HOME_NAME_INVALID,
  IPHONE_HOME_RENAME_FAILURE,
  IPHONE_HOME_SETTLE_MS,
} from "./constants"
import { editIphoneHomeScreen } from "./edit"
import { readIphoneHomeScreen } from "./read"
import { type IphoneHomeScreenPort } from "./types"

function elementCenter(element: IphoneElement): IphonePoint {
  return {
    x: Math.round(element.rect.x + element.rect.width / 2),
    y: Math.round(element.rect.y + element.rect.height / 2),
  }
}

export async function renameIphoneHomeFolder(
  port: IphoneHomeScreenPort,
  name: string,
  newName: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  if (!IPHONE_HOME_KEYBOARD_NAME_PATTERN.test(newName)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_NAME_INVALID }
  }
  const edit = await editIphoneHomeScreen(port, signal)
  if (edit.kind === IPHONE_REFUSED) {
    return edit
  }
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  const matches = state.layout.icons.filter((icon) => icon.folder && icon.name === name)
  const folder = matches[0]
  if (matches.length !== 1 || !folder || state.alert || state.inFolder) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_ICON_MISSING }
  }
  await port.tap(folder.point, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const opened = await readIphoneHomeScreen(port, signal)
  if (opened.kind === IPHONE_REFUSED) {
    return opened
  }
  if (!opened.inFolder || opened.alert || !opened.edit) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_RENAME_FAILURE }
  }
  return renameOpenedIphoneFolder(port, newName, signal)
}

async function renameOpenedIphoneFolder(
  port: IphoneHomeScreenPort,
  newName: string,
  signal: AbortSignal,
): Promise<IphoneSupportResult> {
  const elements = await port.elements(signal)
  const clear = elements.find(isIphoneHomeClearButton)
  if (!clear) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_RENAME_FAILURE }
  }
  await port.tap(elementCenter(clear), signal)
  await port.type(newName, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const after = await port.elements(signal)
  const field = after.find(
    (element) =>
      element.type === IPHONE_HOME_TEXT_FIELD && `${element.name} ${element.label}`.includes(IPHONE_HOME_FOLDER_NAME),
  )
  if (!field || field.value !== newName) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_RENAME_FAILURE }
  }
  await port.tap(IPHONE_HOME_FOLDER_CLOSE_POINT, signal)
  await port.wait(IPHONE_HOME_SETTLE_MS, signal)
  const closed = await readIphoneHomeScreen(port, signal)
  if (closed.kind === IPHONE_REFUSED) {
    return closed
  }
  if (closed.inFolder || closed.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_RENAME_FAILURE }
  }
  return { kind: IPHONE_ACCEPTED }
}
