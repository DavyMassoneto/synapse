import { type ComputerUnityBridgeCommandResult } from "#synapse/modules/computer-use/adapters/unity-bridge"
import {
  COMPUTER_UNITY_BRIDGE_PID_PLACEHOLDER,
  COMPUTER_UNITY_BRIDGE_WINDOW_PLACEHOLDER,
  type ComputerUnityBridgeConfiguration,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_UNITY_BRIDGE_TEST_ATTACH_EXIT,
  COMPUTER_UNITY_BRIDGE_TEST_UNITY_PROBE_EXIT,
} from "./unity-bridge-constants"

export function computerUnityBridgeTestSucceeded(): ComputerUnityBridgeCommandResult {
  return { kind: "command-succeeded" }
}

export function computerUnityBridgeTestProbeNotUnity(): ComputerUnityBridgeCommandResult {
  return { kind: "command-exited", exitCode: COMPUTER_UNITY_BRIDGE_TEST_UNITY_PROBE_EXIT, detail: "mono.dll ausente" }
}

export function computerUnityBridgeTestAttachFailed(): ComputerUnityBridgeCommandResult {
  return { kind: "command-exited", exitCode: COMPUTER_UNITY_BRIDGE_TEST_ATTACH_EXIT, detail: "injeção recusada" }
}

export function computerUnityBridgeTestConfiguration(
  directory: string,
  unityProbe: boolean,
  attachCommand: boolean,
): ComputerUnityBridgeConfiguration {
  const configuration: ComputerUnityBridgeConfiguration = { handshakeDirectory: directory }
  if (unityProbe) {
    configuration.unityProbe = { command: "probe", arguments: ["info", COMPUTER_UNITY_BRIDGE_PID_PLACEHOLDER] }
  }
  if (attachCommand) {
    configuration.attachCommand = {
      command: "attach",
      arguments: ["inject", COMPUTER_UNITY_BRIDGE_PID_PLACEHOLDER, COMPUTER_UNITY_BRIDGE_WINDOW_PLACEHOLDER],
    }
  }
  return configuration
}
