import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import { getAgentDir } from "@earendil-works/pi-coding-agent"
import {
  COMPUTER_DARWIN,
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_LINUX,
  COMPUTER_WIN32,
  type ComputerPlatform,
  type ComputerUseDependencies,
} from "#synapse/modules/computer-use"
import {
  PI_COMPUTER_CAPTURE_DIRECTORY,
  PI_COMPUTER_DRIVER_PATH_VARIABLE,
  PI_COMPUTER_DRIVER_POLICY_CONFIGURED,
  PI_COMPUTER_HOST_TIMEOUT_MILLISECONDS,
  PI_COMPUTER_INSTALLATION_DIRECTORY,
  PI_COMPUTER_LAUNCH_CONFIGURED,
  PI_COMPUTER_STATE_DIRECTORY,
  PI_COMPUTER_UNITY_BRIDGE_CONFIGURED,
  PI_COMPUTER_UNSUPPORTED_PLATFORM,
} from "./constants"
import { computerReadDriverPolicyConfiguration } from "./read-driver-policy-configuration"
import { computerReadLaunchConfiguration } from "./read-launch-configuration"
import { computerReadUnityBridgeConfiguration } from "./read-unity-bridge-configuration"

export function createComputerUseHostDependencies(): ComputerUseDependencies {
  const platform = process.platform
  if (platform !== COMPUTER_DARWIN && platform !== COMPUTER_LINUX && platform !== COMPUTER_WIN32) {
    throw new Error(PI_COMPUTER_UNSUPPORTED_PLATFORM)
  }
  return computerUseDependenciesAt(getAgentDir(), platform, process.env)
}

export function computerUseDependenciesAt(
  agentDirectory: string,
  platform: ComputerPlatform,
  environment: NodeJS.ProcessEnv,
): ComputerUseDependencies {
  const directory = join(agentDirectory, PI_COMPUTER_STATE_DIRECTORY)
  const dependencies: ComputerUseDependencies = {
    platform,
    installationDirectory: join(directory, PI_COMPUTER_INSTALLATION_DIRECTORY),
    captureDirectory: join(directory, PI_COMPUTER_CAPTURE_DIRECTORY),
    wait: { wait: setTimeout<void> },
    environment,
  }
  const driverPath = environment[PI_COMPUTER_DRIVER_PATH_VARIABLE]
  if (driverPath) {
    dependencies.driverPath = driverPath
  }
  const unityBridge = computerReadUnityBridgeConfiguration(agentDirectory)
  if (unityBridge.kind === PI_COMPUTER_UNITY_BRIDGE_CONFIGURED) {
    dependencies.unityBridge = unityBridge.configuration
  }
  const policy = computerReadDriverPolicyConfiguration(agentDirectory)
  if (policy.kind === PI_COMPUTER_DRIVER_POLICY_CONFIGURED) {
    dependencies.driverPolicy = policy.policy
  } else {
    dependencies.driverPolicy = { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE }
  }
  const launch = computerReadLaunchConfiguration(agentDirectory)
  if (launch.kind === PI_COMPUTER_LAUNCH_CONFIGURED) {
    return {
      ...dependencies,
      driverLaunch: {
        command: launch.configuration.command,
        arguments: launch.configuration.arguments,
        environment,
        timeoutMilliseconds: PI_COMPUTER_HOST_TIMEOUT_MILLISECONDS,
        windowsHide: platform === COMPUTER_WIN32,
      },
    }
  }
  return dependencies
}
