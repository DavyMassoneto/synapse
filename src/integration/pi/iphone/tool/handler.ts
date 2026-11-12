import {
  IPHONE_ACTION_SCREENSHOT,
  IPHONE_ACTION_TREE,
  IPHONE_REFUSED,
  IPHONE_RESULT_IMAGE,
  IPHONE_RESULT_TREE,
  type IphoneDeviceActionOutput,
  type IphoneModule,
} from "#synapse/modules"
import {
  PI_IPHONE_ABORT_NAME,
  PI_IPHONE_DEFAULT_MAX,
  PI_IPHONE_DESTINATION_FOUND,
  PI_IPHONE_IMAGE_CONTENT,
  PI_IPHONE_IMAGE_UNSUPPORTED,
  PI_IPHONE_OPTIONAL_SCREENSHOT_FAILED,
  PI_IPHONE_SIGNAL_REQUIRED,
  PI_IPHONE_TEXT_CONTENT,
  PI_IPHONE_VALUE_HOMESCREEN,
} from "./constants"
import { iphoneNumber } from "./input-values"
import { iphoneResultText, treeText } from "./present-result"
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
    const result = await this.dispatch(input, signal)
    return this.present(input, result, supportsImages, signal)
  }

  private async home(input: PiIphoneInput, signal: AbortSignal): Promise<PiIphoneOutput> {
    const result = await this.iphone.home(translateIphoneHome(input), signal)
    return {
      content: [{ type: PI_IPHONE_TEXT_CONTENT, text: JSON.stringify(result) }],
      details: { operation: input.action },
      isError: result.kind === IPHONE_REFUSED,
    }
  }

  private async present(
    input: PiIphoneInput,
    result: IphoneDeviceActionOutput,
    supportsImages: boolean,
    signal: AbortSignal,
  ): Promise<PiIphoneOutput> {
    if (result.kind === IPHONE_RESULT_IMAGE) {
      return {
        content: [{ type: PI_IPHONE_IMAGE_CONTENT, data: result.data, mimeType: result.mimeType }],
        details: { operation: input.action },
        isError: false,
      }
    }
    if (result.kind === IPHONE_RESULT_TREE && supportsImages) {
      return this.treeWithScreenshot(input, treeText(result), signal)
    }
    return {
      content: [{ type: PI_IPHONE_TEXT_CONTENT, text: iphoneResultText(result) }],
      details: { operation: input.action },
      isError: false,
    }
  }

  private async treeWithScreenshot(input: PiIphoneInput, text: string, signal: AbortSignal): Promise<PiIphoneOutput> {
    const content: PiIphoneContent[] = [{ type: PI_IPHONE_TEXT_CONTENT, text }]
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
    return { content, details: { operation: input.action }, isError: false }
  }

  private async dispatch(input: PiIphoneInput, signal: AbortSignal): Promise<IphoneDeviceActionOutput> {
    if (input.tree_after) {
      const action = { ...input }
      delete action.tree_after
      await this.dispatch(action, signal)
      return this.iphone.execute(
        { kind: IPHONE_ACTION_TREE, max: iphoneNumber(PI_IPHONE_DEFAULT_MAX, input.max) },
        signal,
      )
    }
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
