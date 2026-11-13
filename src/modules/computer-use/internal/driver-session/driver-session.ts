import {
  COMPUTER_DRIVER_READ_TOOLS,
  COMPUTER_DRIVER_RESPONSE,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverPort,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import { computerCheckCancellation } from "../execution-cancellation"
import { computerSessionCallArguments } from "./call-arguments"
import {
  COMPUTER_SESSION_CONFIG_MESSAGE,
  COMPUTER_SESSION_CONFIG_TOOL,
  COMPUTER_SESSION_CURSOR_DISABLED,
  COMPUTER_SESSION_CURSOR_TOOL,
  COMPUTER_SESSION_END_TOOL,
  COMPUTER_SESSION_MAX_IMAGE_DIMENSION,
  COMPUTER_SESSION_START_MESSAGE,
  COMPUTER_SESSION_START_TOOL,
} from "./constants"
import { hasComputerTransportFailure } from "./predicates"

export class ComputerDriverSession implements ComputerDriverPort {
  private readonly driver: ComputerDriverPort

  private readonly sessionId: string

  private started = false

  private generation = 0

  private stopping?: Promise<void>

  private tools: ComputerDriverTool[] = []

  private starting?: Promise<ComputerDriverTool[]>

  private readonly overlayEnabled: boolean

  constructor(driver: ComputerDriverPort, sessionId: string, overlayEnabled: boolean) {
    this.driver = driver
    this.sessionId = sessionId
    this.overlayEnabled = overlayEnabled
  }

  start(): Promise<ComputerDriverTool[]> {
    if (this.stopping) {
      return this.stopping.then(this.start.bind(this))
    }
    if (!this.starting) {
      this.starting = this.initialize(this.generation).finally(this.clearStarting.bind(this))
    }
    return this.starting
  }

  private clearStarting(): void {
    delete this.starting
  }

  private async initialize(generation: number): Promise<ComputerDriverTool[]> {
    if (!this.started) {
      this.tools = await this.driver.start()
      this.requireGeneration(generation)
      const result = await this.driver.call(COMPUTER_SESSION_START_TOOL, { session: this.sessionId })
      if (result.kind !== COMPUTER_DRIVER_RESPONSE || result.envelope.isError) {
        await this.driver.stop()
        throw new Error(COMPUTER_SESSION_START_MESSAGE)
      }
      this.requireGeneration(generation)
      await this.configure(generation)
      this.requireGeneration(generation)
      this.started = true
    }
    return this.tools
  }

  private async configure(generation: number): Promise<void> {
    const configuration = await this.driver.call(COMPUTER_SESSION_CONFIG_TOOL, {
      session: this.sessionId,
      max_image_dimension: COMPUTER_SESSION_MAX_IMAGE_DIMENSION,
    })
    await this.requireConfiguration(configuration)
    this.requireGeneration(generation)
    if (!this.overlayEnabled) {
      const cursor = await this.driver.call(COMPUTER_SESSION_CURSOR_TOOL, {
        session: this.sessionId,
        cursor_id: this.sessionId,
        enabled: COMPUTER_SESSION_CURSOR_DISABLED,
      })
      await this.requireConfiguration(cursor)
      this.requireGeneration(generation)
    }
  }

  private async requireConfiguration(result: ComputerDriverCallResult): Promise<void> {
    if (result.kind !== COMPUTER_DRIVER_RESPONSE || result.envelope.isError) {
      await this.invalidate()
      throw new Error(COMPUTER_SESSION_CONFIG_MESSAGE)
    }
  }

  async call(
    name: string,
    argumentsValue: ComputerDriverArguments,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    computerCheckCancellation(signal)
    const generation = this.generation
    await this.start()
    this.requireGeneration(generation)
    computerCheckCancellation(signal)
    const scopedArguments = computerSessionCallArguments(name, argumentsValue, this.sessionId)
    const result = await this.driver.call(name, scopedArguments, signal)
    if (hasComputerTransportFailure(result)) {
      return this.recoverCall(name, scopedArguments, result, generation, signal)
    }
    return result
  }

  private async recoverCall(
    name: string,
    argumentsValue: ComputerDriverArguments,
    result: ComputerDriverCallResult,
    generation: number,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    if (generation !== this.generation) {
      return result
    }
    await this.invalidate()
    if (generation !== this.generation) {
      return result
    }
    if (COMPUTER_DRIVER_READ_TOOLS.includes(name) && !signal?.aborted) {
      return this.retryRead(name, argumentsValue, generation, signal)
    }
    return result
  }

  private async retryRead(
    name: string,
    argumentsValue: ComputerDriverArguments,
    generation: number,
    signal?: AbortSignal,
  ): Promise<ComputerDriverCallResult> {
    await this.start()
    this.requireGeneration(generation)
    computerCheckCancellation(signal)
    const result = await this.driver.call(name, argumentsValue, signal)
    if (hasComputerTransportFailure(result)) {
      await this.invalidate()
    }
    return result
  }

  stop(): Promise<void> {
    if (!this.stopping) {
      this.generation += 1
      this.stopping = this.stopSession().finally(this.clearStopping.bind(this))
    }
    return this.stopping
  }

  private clearStopping(): void {
    delete this.stopping
  }

  private async stopSession(): Promise<void> {
    try {
      if (this.started) {
        await this.driver.call(COMPUTER_SESSION_END_TOOL, { session: this.sessionId })
      }
    } finally {
      await this.invalidate()
      if (this.starting) {
        await this.starting.catch(this.ignoreStoppedStart.bind(this))
      }
      await this.driver.stop()
    }
  }

  private ignoreStoppedStart(error: Error): void {
    if (error.message !== COMPUTER_SESSION_START_MESSAGE) {
      throw error
    }
  }

  private requireGeneration(generation: number): void {
    if (generation !== this.generation) {
      throw new Error(COMPUTER_SESSION_START_MESSAGE)
    }
  }

  private async invalidate(): Promise<void> {
    this.started = false
    this.tools = []
    await this.driver.stop()
  }
}
