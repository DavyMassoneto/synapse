import {
  COMPUTER_DRIVER_DISCONNECTED,
  COMPUTER_DRIVER_READ_TOOLS,
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_DRIVER_TIMEOUT,
  type ComputerDriverArguments,
  type ComputerDriverCallResult,
  type ComputerDriverPort,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_SESSION_CONFIG_TOOL,
  COMPUTER_SESSION_CURSOR_DISABLED,
  COMPUTER_SESSION_CURSOR_TOOL,
  COMPUTER_SESSION_END_TOOL,
  COMPUTER_SESSION_MAX_IMAGE_DIMENSION,
  COMPUTER_SESSION_NATIVE_FOCUS_TOOL,
  COMPUTER_SESSION_START_MESSAGE,
  COMPUTER_SESSION_START_TOOL,
} from "./constants"

export class ComputerDriverSession implements ComputerDriverPort {
  private readonly driver: ComputerDriverPort

  private readonly sessionId: string

  private started = false

  private tools: ComputerDriverTool[] = []

  private starting?: Promise<ComputerDriverTool[]>

  private readonly overlayEnabled: boolean

  constructor(driver: ComputerDriverPort, sessionId: string, overlayEnabled: boolean) {
    this.driver = driver
    this.sessionId = sessionId
    this.overlayEnabled = overlayEnabled
  }

  start(): Promise<ComputerDriverTool[]> {
    if (!this.starting) {
      this.starting = this.initialize().finally(this.clearStarting.bind(this))
    }
    return this.starting
  }

  private clearStarting(): void {
    delete this.starting
  }

  private async initialize(): Promise<ComputerDriverTool[]> {
    if (!this.started) {
      this.tools = await this.driver.start()
      const result = await this.driver.call(COMPUTER_SESSION_START_TOOL, { session: this.sessionId })
      if (result.kind !== COMPUTER_DRIVER_RESPONSE || result.envelope.isError) {
        await this.driver.stop()
        throw new Error(COMPUTER_SESSION_START_MESSAGE)
      }
      await this.configure()
      this.started = true
    }
    return this.tools
  }

  private async configure(): Promise<void> {
    await this.driver.call(COMPUTER_SESSION_CONFIG_TOOL, {
      session: this.sessionId,
      max_image_dimension: COMPUTER_SESSION_MAX_IMAGE_DIMENSION,
    })
    if (!this.overlayEnabled) {
      await this.driver.call(COMPUTER_SESSION_CURSOR_TOOL, {
        session: this.sessionId,
        cursor_id: this.sessionId,
        enabled: COMPUTER_SESSION_CURSOR_DISABLED,
      })
    }
  }

  async call(name: string, argumentsValue: ComputerDriverArguments): Promise<ComputerDriverCallResult> {
    await this.start()
    const scopedArguments = { ...argumentsValue }
    if (name !== COMPUTER_SESSION_NATIVE_FOCUS_TOOL) {
      scopedArguments.session = this.sessionId
    }
    const result = await this.driver.call(name, scopedArguments)
    if (result.kind === COMPUTER_DRIVER_TIMEOUT || result.kind === COMPUTER_DRIVER_DISCONNECTED) {
      await this.invalidate()
      if (COMPUTER_DRIVER_READ_TOOLS.includes(name)) {
        await this.start()
        const retried = await this.driver.call(name, scopedArguments)
        if (retried.kind === COMPUTER_DRIVER_TIMEOUT || retried.kind === COMPUTER_DRIVER_DISCONNECTED) {
          await this.invalidate()
        }
        return retried
      }
    }
    return result
  }

  async stop(): Promise<void> {
    if (this.started) {
      await this.driver.call(COMPUTER_SESSION_END_TOOL, { session: this.sessionId })
    }
    await this.invalidate()
  }

  private async invalidate(): Promise<void> {
    this.started = false
    this.tools = []
    await this.driver.stop()
  }
}
