import { Value } from "typebox/value"
import {
  IPHONE_ACCEPTED,
  IPHONE_MACOS,
  IPHONE_REFUSED,
  type IphoneHost,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_SIMULATOR_ARGUMENTS,
  IPHONE_SIMULATOR_BOOTED,
  IPHONE_SIMULATOR_COMMAND_ERROR,
  IPHONE_SIMULATOR_COMMAND_FAILED,
  IPHONE_SIMULATOR_COMMAND_SUCCEEDED,
  IPHONE_SIMULATOR_DEVICE_LIST_SCHEMA,
  IPHONE_SIMULATOR_EXECUTABLE,
  IPHONE_SIMULATOR_INVALID,
  IPHONE_SIMULATOR_OUTPUT_INVALID,
  IPHONE_SIMULATOR_OUTPUT_SCHEMA,
  IPHONE_SIMULATOR_OUTPUT_VALID,
  IPHONE_SIMULATOR_UNSUPPORTED,
} from "./constants"
import {
  type IphoneBootedSimulator,
  type IphoneSimulatorCommandOutput,
  type IphoneSimulatorCommandResult,
  type IphoneSimulatorDevice,
  type IphoneSimulatorDiscoveryResult,
  type IphoneSimulatorExecutor,
  type IphoneSimulatorOutput,
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
  const output = parseSimulatorOutput(command.output)
  if (output.kind === IPHONE_SIMULATOR_OUTPUT_INVALID) {
    return { kind: IPHONE_REFUSED, message: IPHONE_SIMULATOR_INVALID }
  }
  const simulators: IphoneBootedSimulator[] = []
  for (const devices of output.runtimes) {
    for (const device of devices) {
      if (device.state === IPHONE_SIMULATOR_BOOTED) {
        simulators.push({ udid: device.udid, name: device.name })
      }
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

function parseSimulatorOutput(output: IphoneSimulatorCommandOutput): IphoneSimulatorOutput {
  try {
    const parsed = Value.Parse(IPHONE_SIMULATOR_OUTPUT_SCHEMA, JSON.parse(output.stdout))
    const runtimes: IphoneSimulatorDevice[][] = []
    for (const devices of Object.values(parsed.devices)) {
      runtimes.push(Value.Parse(IPHONE_SIMULATOR_DEVICE_LIST_SCHEMA, devices))
    }
    return { kind: IPHONE_SIMULATOR_OUTPUT_VALID, runtimes }
  } catch {
    return { kind: IPHONE_SIMULATOR_OUTPUT_INVALID }
  }
}
