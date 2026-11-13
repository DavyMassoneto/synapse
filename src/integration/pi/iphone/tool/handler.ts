import { Value } from "typebox/value"
import {
  IPHONE_ACTION_SCREENSHOT,
  IPHONE_ACTION_TREE,
  IPHONE_REFUSED,
  IPHONE_RESULT_IMAGE,
  type IphoneDeviceActionOutput,
  type IphoneModule,
} from "#synapse/modules"
import {
  PI_IPHONE_ABORT_NAME,
  PI_IPHONE_DEFAULT_MAX,
  PI_IPHONE_DESTINATION_FOUND,
  PI_IPHONE_IMAGE_CONTENT,
  PI_IPHONE_IMAGE_UNSUPPORTED,
  PI_IPHONE_INVALID_ARGUMENTS,
  PI_IPHONE_OPTIONAL_SCREENSHOT_FAILED,
  PI_IPHONE_SIGNAL_REQUIRED,
  PI_IPHONE_TEXT_CONTENT,
  PI_IPHONE_TREE_AFTER_FAILED,
  PI_IPHONE_VALUE_HOMESCREEN,
} from "./constants"
import { iphoneNumber } from "./input-values"
import { PI_IPHONE_PARAMETERS } from "./parameters"
import { iphoneResultText } from "./present-result"
import { iphoneDestination, iphoneTargetedRequest } from "./target"
import { translateIphoneAction } from "./translate-action"
import { translateIphoneHome } from "./translate-home"
import {
  type PiIphoneContent,
  type PiIphoneContext,
  type PiIphoneInput,
  type PiIphoneOutput,
  type PiIphoneSignal,
  type PiIphoneUpdate,
} from "./types"

export class PiIphoneTool {
  private readonly iphone: IphoneModule

  constructor(iphone: IphoneModule) {
    this.iphone = iphone
  }

  async execute(
    _id: string,
    input: PiIphoneInput,
    signal: PiIphoneSignal,
    _update: PiIphoneUpdate,
    context: PiIphoneContext,
  ): Promise<PiIphoneOutput> {
    if (!signal) {
      throw new Error(PI_IPHONE_SIGNAL_REQUIRED)
    }
    signal.throwIfAborted()
    if (!Value.Check(PI_IPHONE_PARAMETERS, input)) {
      throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
    }
    const supportsImages = context.model?.input.includes(PI_IPHONE_IMAGE_CONTENT) === true
    if (input.action === IPHONE_ACTION_SCREENSHOT && !supportsImages) {
      return {
        content: [{ type: PI_IPHONE_TEXT_CONTENT, text: PI_IPHONE_IMAGE_UNSUPPORTED }],
        details: { operation: input.action },
        isError: true,
      }
    }
    if (input.action === PI_IPHONE_VALUE_HOMESCREEN) {
      return this.home(input, signal)
    }
    if (input.tree_after) {
      const action = { ...input }
      delete action.tree_after
      const result = await this.dispatch(action, signal)
      try {
        return await this.tree(input, supportsImages, signal)
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error
        }
        return {
          content: [{ type: PI_IPHONE_TEXT_CONTENT, text: PI_IPHONE_TREE_AFTER_FAILED + error.message }],
          details: { operation: input.action, completed: result },
          isError: true,
        }
      }
    }
    if (input.action === IPHONE_ACTION_TREE) {
      return this.tree(input, supportsImages, signal)
    }
    return this.present(input, await this.dispatch(input, signal))
  }

  private async home(input: PiIphoneInput, signal: AbortSignal): Promise<PiIphoneOutput> {
    const result = await this.iphone.home(translateIphoneHome(input), signal)
    return {
      content: [{ type: PI_IPHONE_TEXT_CONTENT, text: JSON.stringify(result) }],
      details: { operation: input.action },
      isError: result.kind === IPHONE_REFUSED,
    }
  }

  private async present(input: PiIphoneInput, result: IphoneDeviceActionOutput): Promise<PiIphoneOutput> {
    if (result.kind === IPHONE_RESULT_IMAGE) {
      return {
        content: [{ type: PI_IPHONE_IMAGE_CONTENT, data: result.data, mimeType: result.mimeType }],
        details: { operation: input.action },
        isError: false,
      }
    }
    return {
      content: [{ type: PI_IPHONE_TEXT_CONTENT, text: iphoneResultText(result) }],
      details: { operation: input.action },
      isError: false,
    }
  }

  private async tree(input: PiIphoneInput, supportsImages: boolean, signal: AbortSignal): Promise<PiIphoneOutput> {
    const content: PiIphoneContent[] = []
    if (supportsImages) {
      await this.capture(content, signal)
    }
    const result = await this.iphone.execute(
      { kind: IPHONE_ACTION_TREE, max: iphoneNumber(PI_IPHONE_DEFAULT_MAX, input.max) },
      signal,
    )
    const output = await this.present(input, result)
    output.content.push(...content)
    return output
  }

  private async capture(content: PiIphoneContent[], signal: AbortSignal): Promise<void> {
    try {
      const screenshot = await this.iphone.execute({ kind: IPHONE_ACTION_SCREENSHOT }, signal)
      if (screenshot.kind === IPHONE_RESULT_IMAGE) {
        content.push({ type: PI_IPHONE_IMAGE_CONTENT, data: screenshot.data, mimeType: screenshot.mimeType })
      }
    } catch (error) {
      signal.throwIfAborted()
      if (error instanceof Error) {
        if (error.name === PI_IPHONE_ABORT_NAME) {
          throw error
        }
        content.push({ type: PI_IPHONE_TEXT_CONTENT, text: PI_IPHONE_OPTIONAL_SCREENSHOT_FAILED + error.message })
      } else {
        throw error
      }
    }
  }

  private async dispatch(input: PiIphoneInput, signal: AbortSignal): Promise<IphoneDeviceActionOutput> {
    if (
      typeof input.element === "number" ||
      input.text ||
      iphoneDestination(input).kind === PI_IPHONE_DESTINATION_FOUND
    ) {
      return this.iphone.executeTargeted(iphoneTargetedRequest(input, translateIphoneAction(input)), signal)
    }
    return this.iphone.execute(translateIphoneAction(input), signal)
  }
}
