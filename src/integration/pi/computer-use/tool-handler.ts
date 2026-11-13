import { Value } from "typebox/value"
import { type ComputerUse } from "#synapse/modules"
import { translateComputerAction } from "./action-translation"
import { PI_COMPUTER_CANCELLED_MESSAGE, PI_COMPUTER_IMAGE_CONTENT } from "./constants"
import { computerToolError, computerToolOutput } from "./render-output"
import { PI_COMPUTER_PARAMETERS, type PiComputerInput } from "./tool-schema"
import {
  type PiComputerToolContext,
  type PiComputerToolOutput,
  type PiComputerToolSignal,
  type PiComputerToolUpdate,
} from "./types"

export class PiComputerToolHandler {
  private readonly computer: ComputerUse

  constructor(computer: ComputerUse) {
    this.computer = computer
  }

  async execute(
    _id: string,
    input: PiComputerInput,
    signal: PiComputerToolSignal,
    _update: PiComputerToolUpdate,
    context: PiComputerToolContext,
  ): Promise<PiComputerToolOutput> {
    if (signal?.aborted) {
      return computerToolError(PI_COMPUTER_CANCELLED_MESSAGE)
    }
    try {
      const argumentsValue = Value.Parse(PI_COMPUTER_PARAMETERS, input)
      const action = translateComputerAction(argumentsValue)
      const result = await this.computer.execute(
        action,
        {
          sessionId: context.sessionManager.getSessionId(),
          modelSupportsImages: Boolean(context.model?.input.includes(PI_COMPUTER_IMAGE_CONTENT)),
        },
        signal,
      )
      return computerToolOutput(result)
    } catch (error) {
      if (error instanceof Error) {
        return computerToolError(error.message)
      }
      throw error
    }
  }
}
