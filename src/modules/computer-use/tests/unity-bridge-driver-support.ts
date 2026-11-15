import {
  type ComputerUnityBridgeCommandResult,
  type ComputerUnityBridgeCommandRunner,
  type ComputerUnityBridgeSize,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import {
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_IMAGE_PRESENT,
  COMPUTER_PNG_MIME,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverPort,
  type ComputerDriverTool,
  type ComputerUnityBridgeCommand,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeTestDriverCall } from "./unity-bridge-types"

export class ComputerUnityBridgeTestDriver implements ComputerDriverPort {
  readonly calls: ComputerUnityBridgeTestDriverCall[] = []
  private readonly image: ComputerUnityBridgeSize

  constructor(image: ComputerUnityBridgeSize) {
    this.image = image
  }

  start(): Promise<ComputerDriverTool[]> {
    return Promise.resolve([])
  }

  stop(): Promise<void> {
    return Promise.resolve()
  }

  call(name: string, argumentsValue: ComputerDriverArguments): Promise<ComputerDriverCallResult> {
    this.calls.push({ name, argumentsValue })
    return Promise.resolve({
      kind: COMPUTER_DRIVER_RESPONSE,
      envelope: {
        message: "capturado",
        isError: false,
        windows: [],
        applications: [],
        elements: [],
        tree: "",
        image: {
          kind: COMPUTER_IMAGE_PRESENT,
          data: "",
          mime: COMPUTER_PNG_MIME,
          width: this.image.width,
          height: this.image.height,
        },
      },
    })
  }
}

export class ComputerUnityBridgeTestCommands {
  readonly calls: ComputerUnityBridgeCommand[] = []
  readonly runner: ComputerUnityBridgeCommandRunner
  private readonly results: ComputerUnityBridgeCommandResult[]

  constructor(results: ComputerUnityBridgeCommandResult[]) {
    this.results = results
    this.runner = (command: ComputerUnityBridgeCommand) => this.run(command)
  }

  private run(command: ComputerUnityBridgeCommand): Promise<ComputerUnityBridgeCommandResult> {
    this.calls.push(command)
    const result = this.results.shift()
    if (result) {
      return Promise.resolve(result)
    }
    return Promise.resolve({ kind: "command-unavailable", detail: "sem roteiro" })
  }
}
