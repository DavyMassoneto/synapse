import {
  IPHONE_ACCEPTED,
  IPHONE_MACOS,
  IPHONE_REFUSED,
  type IphoneHost,
} from "#synapse/modules/iphone/public/contracts"
import { IphoneSimctlDeviceListReader } from "../simctl-device-list-reading"
import {
  IPHONE_SIMULATOR_ARGUMENTS,
  IPHONE_SIMULATOR_BOOTED,
  IPHONE_SIMULATOR_COMMAND_ERROR,
  IPHONE_SIMULATOR_COMMAND_FAILED,
  IPHONE_SIMULATOR_COMMAND_SUCCEEDED,
  IPHONE_SIMULATOR_EXECUTABLE,
  IPHONE_SIMULATOR_INVALID,
  IPHONE_SIMULATOR_OUTPUT_INVALID,
  IPHONE_SIMULATOR_UNSUPPORTED,
} from "./constants"
import {
  type IphoneBootedSimulator,
  type IphoneSimulatorCommandResult,
  type IphoneSimulatorDiscoveryResult,
  type IphoneSimulatorExecutor,
} from "./types"

export async function discoverIphoneSimulators(
  host: IphoneHost,
  executor: IphoneSimulatorExecutor,
): Promise<IphoneSimulatorDiscoveryResult> {
  if (host !== IPHONE_MACOS) {
    return { kind: IPHONE_REFUSED, message: IPHONE_SIMULATOR_UNSUPPORTED }
  }
  const command = await listSimulators(executor)
  if (command.kind === IPHONE_SIMULATOR_COMMAND_ERROR) {
    return { kind: IPHONE_REFUSED, message: command.message }
  }
  const output = new IphoneSimctlDeviceListReader(command.output.stdout).read()
  if (output.kind === IPHONE_SIMULATOR_OUTPUT_INVALID) {
    return { kind: IPHONE_REFUSED, message: IPHONE_SIMULATOR_INVALID }
  }
  const simulators: IphoneBootedSimulator[] = []
  for (const device of output.devices) {
    if (device.state === IPHONE_SIMULATOR_BOOTED) {
      simulators.push({ udid: device.udid, name: device.name })
    }
  }
  return { kind: IPHONE_ACCEPTED, simulators }
}

async function listSimulators(executor: IphoneSimulatorExecutor): Promise<IphoneSimulatorCommandResult> {
  try {
    const output = await executor(IPHONE_SIMULATOR_EXECUTABLE, IPHONE_SIMULATOR_ARGUMENTS)
    return { kind: IPHONE_SIMULATOR_COMMAND_SUCCEEDED, output }
  } catch (error) {
    if (error instanceof Error) {
      return { kind: IPHONE_SIMULATOR_COMMAND_ERROR, message: `${IPHONE_SIMULATOR_COMMAND_FAILED} ${error.message}` }
    }
    throw error
  }
}
