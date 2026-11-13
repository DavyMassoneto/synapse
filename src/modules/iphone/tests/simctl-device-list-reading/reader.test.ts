import { expect, test } from "vitest"
import { IphoneSimctlDeviceListReader } from "#synapse/modules/iphone/adapters/simctl-device-list-reading"
import {
  IPHONE_SIMULATOR_OUTPUT_INVALID,
  IPHONE_SIMULATOR_OUTPUT_VALID,
} from "#synapse/modules/iphone/adapters/simulator-discovery"
import {
  SIMCTL_DEEP_SCENARIO,
  SIMCTL_DEEP_SOURCE,
  SIMCTL_DEVICE,
  SIMCTL_INVALID_CASES,
  SIMCTL_MALFORMED_DEEP_SCENARIO,
  SIMCTL_MALFORMED_DEEP_SOURCE,
  SIMCTL_SCENARIO_NAME,
  SIMCTL_VALID_CASES,
} from "./constants"
import { type IphoneSimctlInvalidCase, type IphoneSimctlValidCase } from "./types"

function readsValidInput(scenario: IphoneSimctlValidCase): void {
  const actual = new IphoneSimctlDeviceListReader(scenario.source).read()
  expect(actual).toStrictEqual({ kind: IPHONE_SIMULATOR_OUTPUT_VALID, devices: scenario.devices })
}

function rejectsInvalidInput(scenario: IphoneSimctlInvalidCase): void {
  expect(new IphoneSimctlDeviceListReader(scenario.source).read()).toStrictEqual({
    kind: IPHONE_SIMULATOR_OUTPUT_INVALID,
  })
}

function readsDeepExtraWithoutRecursion(): void {
  expect(new IphoneSimctlDeviceListReader(SIMCTL_DEEP_SOURCE).read()).toStrictEqual({
    kind: IPHONE_SIMULATOR_OUTPUT_VALID,
    devices: [SIMCTL_DEVICE],
  })
}

function rejectsMalformedDeepExtra(): void {
  expect(new IphoneSimctlDeviceListReader(SIMCTL_MALFORMED_DEEP_SOURCE).read()).toStrictEqual({
    kind: IPHONE_SIMULATOR_OUTPUT_INVALID,
  })
}

test.each(SIMCTL_VALID_CASES)(SIMCTL_SCENARIO_NAME, readsValidInput)
test.each(SIMCTL_INVALID_CASES)(SIMCTL_SCENARIO_NAME, rejectsInvalidInput)
test(SIMCTL_DEEP_SCENARIO, readsDeepExtraWithoutRecursion)
test(SIMCTL_MALFORMED_DEEP_SCENARIO, rejectsMalformedDeepExtra)
