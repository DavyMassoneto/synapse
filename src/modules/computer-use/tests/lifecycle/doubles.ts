import {
  COMPUTER_CAPTURE_NOT_STORED,
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_IMAGE_ABSENT,
  type ComputerCapture,
  type ComputerCaptureStorageResult,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverInfrastructure,
  type ComputerDriverLaunch,
  type ComputerDriverManifest,
  type ComputerDriverPort,
  type ComputerDriverTool,
  type ComputerPresentImage,
} from "#synapse/modules/computer-use/public/contracts"
import { type LifecycleLaunchResolver } from "./types"

export class LifecycleInfrastructure implements ComputerDriverInfrastructure, ComputerDriverPort {
  readonly calls: string[] = []

  readonly storage = { storeImage: this.storeImage.bind(this), storeElements: this.storeElements.bind(this) }

  private resolveLaunch?: LifecycleLaunchResolver

  readonly launchPending = new Promise<ComputerDriverLaunch>(this.holdLaunch.bind(this))

  private holdLaunch(resolve: LifecycleLaunchResolver): void {
    this.resolveLaunch = resolve
  }

  releaseLaunch(): void {
    this.resolveLaunch?.({
      command: "fake",
      arguments: [],
      environment: {},
      timeoutMilliseconds: 1000,
      windowsHide: true,
    })
  }

  launch(): Promise<ComputerDriverLaunch> {
    return this.launchPending
  }

  async manifest(_launch: ComputerDriverLaunch): Promise<ComputerDriverManifest> {
    return { version: "0.21.0", arguments: [] }
  }

  driver(_launch: ComputerDriverLaunch): ComputerDriverPort {
    return this
  }

  async install(): Promise<string> {
    return "fake"
  }

  async start(): Promise<ComputerDriverTool[]> {
    this.calls.push("start")
    return []
  }

  async call(name: string, _arguments: ComputerDriverArguments): Promise<ComputerDriverCallResult> {
    this.calls.push(name)
    return {
      kind: COMPUTER_DRIVER_RESPONSE,
      envelope: {
        message: "feito",
        isError: false,
        windows: [],
        applications: [],
        elements: [],
        tree: "",
        image: { kind: COMPUTER_IMAGE_ABSENT },
      },
    }
  }

  async stop(): Promise<void> {
    this.calls.push("stop")
  }

  private storeImage(_image: ComputerPresentImage): ComputerCaptureStorageResult {
    return { kind: COMPUTER_CAPTURE_NOT_STORED, message: "teste" }
  }

  private storeElements(_capture: ComputerCapture): ComputerCaptureStorageResult {
    return { kind: COMPUTER_CAPTURE_NOT_STORED, message: "teste" }
  }
}
