import {
  type ComputerDriverInfrastructure,
  type ComputerDriverLaunch,
  type ComputerDriverManifest,
  type ComputerDriverPort,
} from "#synapse/modules/computer-use/public"
import { ComputerTestCaptureStorage } from "../doubles"

export class ComputerResultsInfrastructure implements ComputerDriverInfrastructure {
  readonly storage = new ComputerTestCaptureStorage()

  private readonly port: ComputerDriverPort

  constructor(driver: ComputerDriverPort) {
    this.port = driver
  }

  async launch(): Promise<ComputerDriverLaunch> {
    return { command: "unused", arguments: [], environment: {}, timeoutMilliseconds: 100, windowsHide: true }
  }

  async manifest(_launch: ComputerDriverLaunch): Promise<ComputerDriverManifest> {
    return { version: "0.21.0", arguments: [] }
  }

  driver(_launch: ComputerDriverLaunch): ComputerDriverPort {
    return this.port
  }

  async install(): Promise<string> {
    throw new Error("Installation is not part of result tests")
  }
}
