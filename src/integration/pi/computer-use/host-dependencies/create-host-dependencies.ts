import { join } from "node:path"
import { getAgentDir } from "@earendil-works/pi-coding-agent"
import {
  COMPUTER_DARWIN,
  COMPUTER_LINUX,
  COMPUTER_WIN32,
  type ComputerPlatform,
  type ComputerUseDependencies,
} from "#synapse/modules"
import {
  PI_COMPUTER_CAPTURE_DIRECTORY,
  PI_COMPUTER_DRIVER_PATH_VARIABLE,
  PI_COMPUTER_HOST_TIMEOUT_MILLISECONDS,
  PI_COMPUTER_INSTALLATION_DIRECTORY,
  PI_COMPUTER_LAUNCH_CONFIGURED,
  PI_COMPUTER_STATE_DIRECTORY,
  PI_COMPUTER_UNSUPPORTED_PLATFORM,
} from "./constants"
import { PiComputerHostWait } from "./host-wait"
import { computerReadLaunchConfiguration } from "./read-launch-configuration"

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
    wait: new PiComputerHostWait(),
    environment,
  }
  const driverPath = environment[PI_COMPUTER_DRIVER_PATH_VARIABLE]
  if (driverPath) {
    dependencies.driverPath = driverPath
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
