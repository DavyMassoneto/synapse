import { SIMCTL_INVALID, SIMCTL_VALID } from "./constants"
import { isIphoneJsonArrayIndex } from "./predicates"
import {
  type IphoneSimctlReading,
  type IphoneSimctlRuntimeGroup,
  type IphoneSimctlRuntimeGroups,
  type IphoneSimulatorDevice,
} from "./types"

export function orderIphoneSimctlRuntimes(groups: IphoneSimctlRuntimeGroups): IphoneSimctlReading {
  const indexed: IphoneSimctlRuntimeGroup[] = []
  const named: IphoneSimctlRuntimeGroup[] = []
  for (const [key, reading] of groups) {
    if (reading.kind === SIMCTL_INVALID) {
      return { kind: SIMCTL_INVALID }
    }
    const group: IphoneSimctlRuntimeGroup = { key, reading }
    if (isIphoneJsonArrayIndex(key)) {
      indexed.push(group)
    } else {
      named.push(group)
    }
  }
  indexed.sort(compareRuntimeIndices)
  const devices: IphoneSimulatorDevice[] = []
  appendRuntimeDevices(indexed, devices)
  appendRuntimeDevices(named, devices)
  return { kind: SIMCTL_VALID, devices }
}

function compareRuntimeIndices(left: IphoneSimctlRuntimeGroup, right: IphoneSimctlRuntimeGroup): number {
  return Number(left.key) - Number(right.key)
}

function appendRuntimeDevices(groups: IphoneSimctlRuntimeGroup[], devices: IphoneSimulatorDevice[]): void {
  for (const group of groups) {
    for (const device of group.reading.devices) {
      devices.push(device)
    }
  }
}
