import {
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverInfrastructure,
  type ComputerDriverLaunch,
  type ComputerDriverManifest,
  type ComputerDriverPort,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerTestCaptureStorage } from "../doubles"
import { COMPUTER_CANCELLATION_RESPONSE } from "./constants"

export class ComputerCancellationDriver implements ComputerDriverInfrastructure, ComputerDriverPort {
  readonly calls: string[] = []
  readonly storage = new ComputerTestCaptureStorage()
  readonly controller = new AbortController()
  readonly inputEntered = Promise.withResolvers<void>()
  readonly inputResponse = Promise.withResolvers<ComputerDriverCallResult>()
  readonly startEntered = Promise.withResolvers<void>()
  readonly startResponse = Promise.withResolvers<ComputerDriverTool[]>()
  holdInput = false
  holdStart = false
  abortAfterCall = ""
  timeoutCall = ""

  async launch(): Promise<ComputerDriverLaunch> {
    this.calls.push("launch")
    return { command: "fake", arguments: [], environment: {}, timeoutMilliseconds: 1000, windowsHide: true }
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
    this.startEntered.resolve()
    if (this.holdStart) {
      return this.startResponse.promise
    }
    return [{ name: "bring_to_front", inputProperties: [] }]
  }

  async call(
    name: string,
    _arguments: ComputerDriverArguments,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    if (signal?.aborted) {
      throw new Error("cancelled signal reached fake driver")
    }
    this.calls.push(name)
    if (name === this.abortAfterCall) {
      this.controller.abort()
    }
    if (name === this.timeoutCall) {
      return { kind: "driver-timeout", message: "may have happened" }
    }
    if (name === "click" && this.holdInput) {
      this.inputEntered.resolve()
      return this.inputResponse.promise
    }
    return COMPUTER_CANCELLATION_RESPONSE
  }

  async stop(): Promise<void> {
    this.calls.push("stop")
  }
}
