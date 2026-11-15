import {
  COMPUTER_WIN32,
  type ComputerDriverInfrastructure,
  type ComputerDriverLaunch,
  type ComputerDriverLaunchRequest,
  type ComputerDriverManifest,
  type ComputerDriverPolicy,
  type ComputerDriverPort,
  type ComputerDriverReleaseSelection,
  type ComputerUseDependencies,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerCaptureFiles } from "../capture-files"
import { ComputerDriverCli } from "../driver-cli"
import { computerInstallDriver } from "../driver-installation"
import {
  COMPUTER_DRIVER_ABSENT,
  COMPUTER_DRIVER_NOT_INSTALLED,
  COMPUTER_DRIVER_OVERRIDE_MISSING,
  computerLocateDriver,
} from "../driver-location"
import { ComputerDriverProcess } from "../driver-process"
import {
  COMPUTER_DRIVER_RELEASE_API_URL,
  COMPUTER_DRIVER_RELEASE_ASSET_BASE_URL,
  COMPUTER_DRIVER_RELEASE_RESOLVED,
  computerResolveDriverRelease,
} from "../driver-release"
import { computerFilterDriverEnvironment } from "../environment-filtering"
import { ComputerUnityBridgeDriver, computerRunUnityBridgeCommand } from "../unity-bridge"
import {
  COMPUTER_DRIVER_POLICY_DEFAULT,
  COMPUTER_SYSTEM_DRIVER_TIMEOUT_MILLISECONDS,
  COMPUTER_SYSTEM_RUNTIME_VERSION_DIVERGENCE,
} from "./constants"

export class ComputerSystemInfrastructure implements ComputerDriverInfrastructure {
  private readonly dependencies: ComputerUseDependencies

  readonly storage: ComputerCaptureFiles

  private runtimeVersion?: string

  constructor(dependencies: ComputerUseDependencies) {
    this.dependencies = dependencies
    this.storage = new ComputerCaptureFiles(dependencies.captureDirectory, dependencies.platform)
  }

  async launch(request: ComputerDriverLaunchRequest): Promise<ComputerDriverLaunch> {
    delete this.runtimeVersion
    if (this.dependencies.driverLaunch) {
      return this.dependencies.driverLaunch
    }
    const command = await this.resolveCommand(request)
    return {
      command,
      arguments: [],
      environment: computerFilterDriverEnvironment(this.dependencies.environment),
      timeoutMilliseconds: COMPUTER_SYSTEM_DRIVER_TIMEOUT_MILLISECONDS,
      windowsHide: this.dependencies.platform === COMPUTER_WIN32,
    }
  }

  private async resolveCommand(request: ComputerDriverLaunchRequest): Promise<string> {
    const directory = this.dependencies.installationDirectory
    const platform = this.dependencies.platform
    const override = this.dependencies.driverPath
    if (override) {
      const location = await computerLocateDriver(directory, platform, override)
      if (location.kind === COMPUTER_DRIVER_ABSENT) {
        throw new Error(COMPUTER_DRIVER_OVERRIDE_MISSING)
      }
      return location.command
    }
    if (request.provisionMissing) {
      return this.install()
    }
    const location = await computerLocateDriver(directory, platform)
    if (location.kind === COMPUTER_DRIVER_ABSENT) {
      throw new Error(COMPUTER_DRIVER_NOT_INSTALLED)
    }
    return location.command
  }

  async manifest(launch: ComputerDriverLaunch): Promise<ComputerDriverManifest> {
    const manifest = await new ComputerDriverCli(launch).manifest()
    this.requireEffectiveVersion(manifest.binary_version)
    return { version: manifest.binary_version, arguments: [...launch.arguments, ...manifest.mcp_invocation.args] }
  }

  private requireEffectiveVersion(version: string): void {
    if (this.runtimeVersion && version !== this.runtimeVersion) {
      throw new Error(
        `${COMPUTER_SYSTEM_RUNTIME_VERSION_DIVERGENCE} reportada ${version}, selecionada ${this.runtimeVersion}.`,
      )
    }
  }

  driver(launch: ComputerDriverLaunch): ComputerDriverPort {
    const driver = new ComputerDriverProcess(launch)
    const configuration = this.dependencies.unityBridge
    if (configuration) {
      return new ComputerUnityBridgeDriver(driver, configuration, computerRunUnityBridgeCommand)
    }
    return driver
  }

  async install(): Promise<string> {
    const selection = await this.resolveSelection()
    this.runtimeVersion = selection.version
    return computerInstallDriver({
      directory: this.dependencies.installationDirectory,
      selection,
      policy: this.driverPolicy(),
    })
  }

  private driverPolicy(): ComputerDriverPolicy {
    const policy = this.dependencies.driverPolicy
    if (!policy) {
      return COMPUTER_DRIVER_POLICY_DEFAULT
    }
    return policy
  }

  private async resolveSelection(): Promise<ComputerDriverReleaseSelection> {
    const resolution = await computerResolveDriverRelease({
      policy: this.driverPolicy(),
      platform: this.dependencies.platform,
      architecture: process.arch,
      releasesApiUrl: COMPUTER_DRIVER_RELEASE_API_URL,
      assetBaseUrl: COMPUTER_DRIVER_RELEASE_ASSET_BASE_URL,
      cachedPages: [],
      fetch,
    })
    if (resolution.kind !== COMPUTER_DRIVER_RELEASE_RESOLVED) {
      throw new Error(resolution.message)
    }
    return resolution.selection
  }
}
