import {
  IPHONE_ACCEPTED,
  IPHONE_HOME_PAGE_KNOWN,
  IPHONE_HOME_PAGE_MISSING,
  IPHONE_REFUSED,
  type IphoneElement,
  type IphoneHomeFolderCount,
  type IphoneHomePage,
  type IphoneHomeStateResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_ALERT,
  IPHONE_HOME_APP_COUNT_PATTERN,
  IPHONE_HOME_BUTTON,
  IPHONE_HOME_FOLDER_NAME,
  IPHONE_HOME_PAGE_INDICATOR,
  IPHONE_HOME_PAGE_PATTERN,
  IPHONE_HOME_TEXT_FIELD,
} from "./constants"
import { readIphoneHomeLayout } from "./layout"
import { isIphoneHomeClearButton, isIphoneHomeEditButton } from "./predicates"
import { type IphoneHomeIndicators, type IphoneHomeInput } from "./types"

function readIphonePage(elements: IphoneElement[]): IphoneHomePage {
  for (const element of elements) {
    if (element.type === IPHONE_HOME_PAGE_INDICATOR) {
      const match = IPHONE_HOME_PAGE_PATTERN.exec(element.value ? element.value : element.label)
      if (match?.[1] && match[2]) {
        return { kind: IPHONE_HOME_PAGE_KNOWN, current: Number(match[1]), total: Number(match[2]) }
      }
    }
  }
  return { kind: IPHONE_HOME_PAGE_MISSING }
}

export function readIphoneFolderAppCount(badge: string): IphoneHomeFolderCount {
  const match = IPHONE_HOME_APP_COUNT_PATTERN.exec(badge)
  if (match?.[1]) {
    return { kind: IPHONE_HOME_PAGE_KNOWN, count: Number(match[1]) }
  }
  return { kind: IPHONE_HOME_PAGE_MISSING }
}

export function readIphoneHomeState(input: IphoneHomeInput): IphoneHomeStateResult {
  const result = readIphoneHomeLayout(input)
  if (result.kind === IPHONE_REFUSED) {
    return result
  }
  const indicators = readIphoneHomeIndicators(input.elements)
  return {
    kind: IPHONE_ACCEPTED,
    layout: result.layout,
    page: readIphonePage(input.elements),
    ...indicators,
  }
}

function readIphoneHomeIndicators(elements: IphoneElement[]): IphoneHomeIndicators {
  let edit = false
  let alert = false
  let inFolder = false
  let clearText = false
  for (const element of elements) {
    if (element.type === IPHONE_HOME_BUTTON) {
      if (isIphoneHomeEditButton(element)) {
        edit = true
      }
      if (isIphoneHomeClearButton(element)) {
        clearText = true
      }
    }
    if (element.type === IPHONE_HOME_ALERT) {
      alert = true
    }
    if (
      element.type === IPHONE_HOME_TEXT_FIELD &&
      `${element.name} ${element.label}`.includes(IPHONE_HOME_FOLDER_NAME)
    ) {
      inFolder = true
    }
  }
  return { edit, alert, inFolder, clearText }
}
