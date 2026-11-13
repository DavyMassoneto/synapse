import {
  COMPUTER_WIN32,
  type ComputerDriverInfrastructure,
  type ComputerDriverLaunch,
  type ComputerDriverManifest,
  type ComputerDriverPort,
  type ComputerUseDependencies,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerCaptureFiles } from "../capture-files"
import { ComputerDriverCli } from "../driver-cli"
import { computerInstallDriver } from "../driver-installation"
import { computerLocateDriver } from "../driver-location"
import { ComputerDriverProcess } from "../driver-process"
import { computerFilterDriverEnvironment } from "../environment-filtering"
import { COMPUTER_SYSTEM_DRIVER_TIMEOUT_MILLISECONDS } from "./constants"

export class ComputerSystemInfrastructure implements ComputerDriverInfrastructure {
  private readonly dependencies: ComputerUseDependencies

  readonly storage: ComputerCaptureFiles

  constructor(dependencies: ComputerUseDependencies) {
    this.dependencies = dependencies
    this.storage = new ComputerCaptureFiles(dependencies.captureDirectory, dependencies.platform)
  }

  async launch(): Promise<ComputerDriverLaunch> {
    if (this.dependencies.driverLaunch) {
      return this.dependencies.driverLaunch
    }
    const command = await computerLocateDriver(
      this.dependencies.installationDirectory,
      this.dependencies.platform,
      this.dependencies.driverPath,
    )
    return {
      command,
      arguments: [],
      environment: computerFilterDriverEnvironment(this.dependencies.environment),
      timeoutMilliseconds: COMPUTER_SYSTEM_DRIVER_TIMEOUT_MILLISECONDS,
      windowsHide: this.dependencies.platform === COMPUTER_WIN32,
    }
  }

  async manifest(launch: ComputerDriverLaunch): Promise<ComputerDriverManifest> {
    const manifest = await new ComputerDriverCli(launch).manifest()
    return { version: manifest.binary_version, arguments: [...launch.arguments, ...manifest.mcp_invocation.args] }
  }

  driver(launch: ComputerDriverLaunch): ComputerDriverPort {
    return new ComputerDriverProcess(launch)
  }

  install(): Promise<string> {
    return computerInstallDriver(this.dependencies.installationDirectory, this.dependencies.platform, process.arch)
  }
}
