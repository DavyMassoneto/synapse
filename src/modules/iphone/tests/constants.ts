import {
  IPHONE_TARGET_ELEMENT,
  type IphoneConfiguration,
  type IphoneDragSpec,
  type IphoneElementTarget,
  type IphoneHost,
  type IphoneMobileInfo,
  type IphoneModuleDependencies,
  type IphonePoint,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_HOME_DRAG_CALIBRATION,
  IPHONE_HOME_FLIP_WAIT_MS,
  IPHONE_HOME_GRID,
  type IphoneEdge,
  type IphonePageDragSpec,
} from "../internal"
import { noIphoneLifecycleCommand } from "./lifecycle-support"
import { type IphoneWebDriverAdditionalInfoResponse, type IphoneWebDriverMalformedInfoResponse } from "./types"

export const IPHONE_LIFECYCLE_DEPENDENCIES: IphoneModuleDependencies = {
  host: "darwin",
  configPath: "fake",
  stateDirectory: "fake",
  path: "fake",
  executeSimulatorCommand: noIphoneLifecycleCommand,
}

export const IPHONE_TEST_UTF8_BOM = "\uFEFF"

export const IPHONE_TEST_ROUNDED_CENTER: IphonePoint = { x: 13, y: 24 }

export const IPHONE_TEST_NEGATIVE_CENTER: IphonePoint = { x: -6, y: -2 }

export const IPHONE_TEST_MISSING_CENTER_TARGET: IphoneElementTarget = { kind: IPHONE_TARGET_ELEMENT, index: 99 }

export const IPHONE_TEST_CALIBRATED_FROM: IphonePoint = { x: 11, y: 22 }

export const IPHONE_TEST_CALIBRATED_DESTINATION: IphonePoint = { x: 201, y: 203 }

export const IPHONE_TEST_CALIBRATED_EDGE: IphoneEdge = "left"

export const IPHONE_TEST_CALIBRATED_DRAG: IphoneDragSpec = {
  from: IPHONE_TEST_CALIBRATED_FROM,
  destination: IPHONE_TEST_CALIBRATED_DESTINATION,
  ...IPHONE_HOME_DRAG_CALIBRATION,
}

export const IPHONE_TEST_CALIBRATED_PAGE_DRAG: IphonePageDragSpec = {
  drag: IPHONE_TEST_CALIBRATED_DRAG,
  edge: IPHONE_TEST_CALIBRATED_EDGE,
  viewportWidth: IPHONE_HOME_GRID.width,
  flips: 1,
  flipWaitMs: IPHONE_HOME_FLIP_WAIT_MS,
}

export const IPHONE_WEBDRIVER_INFO_CONFIGURATION: IphoneConfiguration = {
  serverUrl: "http://localhost:1",
  target: { kind: "device", udid: "test", deviceName: "test", wdaInstalled: true },
}

export const IPHONE_WEBDRIVER_INFO_HOST: IphoneHost = "darwin"

export const IPHONE_WEBDRIVER_INFO_SCRIPT = "deviceInfo"

export const IPHONE_WEBDRIVER_INFO_MALFORMED_RESPONSE: IphoneWebDriverMalformedInfoResponse = {
  value: { error: 7, message: "invalid" },
}

export const IPHONE_WEBDRIVER_INFO_ADDITIONAL_RESPONSE: IphoneWebDriverAdditionalInfoResponse = {
  value: { name: "Phone", extra: 42 },
}

export const IPHONE_WEBDRIVER_INFO_EXPECTED: IphoneMobileInfo = { name: "Phone" }

export const IPHONE_WEBDRIVER_INFO_ACCEPTS_DESCRIPTION = "aceita campos adicionais legítimos de informações"

export const IPHONE_WEBDRIVER_INFO_REJECTS_DESCRIPTION = "recusa erro W3C malformado na resposta de informações"

export const IPHONE_WEBDRIVER_INFO_SUITE_DESCRIPTION = "formato das informações WebDriver"
