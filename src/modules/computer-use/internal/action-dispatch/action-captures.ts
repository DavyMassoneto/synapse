import {
  COMPUTER_CAPTURE,
  COMPUTER_COMPLETED,
  COMPUTER_UNCONFIRMED,
  type ComputerCaptureAction,
  type ComputerCaptureStoragePort,
  type ComputerDriverTool,
  type ComputerExecutedAction,
  type ComputerExecutionContext,
  type ComputerRenderedScreenshot,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerCaptureRenderer, computerPublicCapture } from "../capture-rendering"
import { COMPUTER_CANCELLED_MESSAGE } from "../execution-cancellation"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  type ComputerSelectedExactTarget,
  type ComputerStickyWindowTarget,
  computerTargetIdentity,
} from "../window-targeting"
import { type ComputerCaptureDispatch } from "./capture-dispatch"
import {
  COMPUTER_DISPATCH_TOKEN_PROPERTY,
  COMPUTER_DISPATCH_UNKNOWN_FAILURE,
  COMPUTER_PREPARED_TARGET_ELEMENT,
} from "./constants"
import { type ComputerDispatchPreparedInput, type ComputerInputAction, type ComputerSnapshotTokens } from "./types"

export class ComputerActionCaptures {
  private readonly reader: ComputerCaptureDispatch
  private readonly target: ComputerStickyWindowTarget
  private readonly renderer: ComputerCaptureRenderer
  private readonly snapshotTokens: ComputerSnapshotTokens = new Map()

  constructor(
    capture: ComputerCaptureDispatch,
    target: ComputerStickyWindowTarget,
    storage: ComputerCaptureStoragePort,
  ) {
    this.reader = capture
    this.target = target
    this.renderer = new ComputerCaptureRenderer(storage)
  }

  reset(): void {
    this.snapshotTokens.clear()
    this.renderer.reset()
  }

  async capture(
    action: ComputerCaptureAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerRenderedScreenshot> {
    const capture = await this.reader.capture(action, signal)
    this.snapshotTokens.clear()
    for (const element of capture.elements) {
      if (element.token) {
        this.snapshotTokens.set(element.index, element.token)
      }
    }
    return computerPublicCapture(this.renderer.render(capture, context))
  }

  attachToken(prepared: ComputerDispatchPreparedInput, tools: ComputerDriverTool[]): void {
    const target = prepared.target
    if (target.kind === COMPUTER_PREPARED_TARGET_ELEMENT) {
      const token = this.snapshotTokens.get(target.index)
      const tool = tools.find((tool) => tool.name === prepared.tool)
      if (token && tool?.inputProperties.includes(COMPUTER_DISPATCH_TOKEN_PROPERTY)) {
        prepared.arguments.element_token = token
      }
    }
  }

  async after(
    action: ComputerInputAction,
    result: ComputerExecutedAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<void> {
    if (
      action.captureAfter &&
      (result.result.kind === COMPUTER_COMPLETED || result.result.kind === COMPUTER_UNCONFIRMED)
    ) {
      if (signal?.aborted) {
        result.captureFailure = COMPUTER_CANCELLED_MESSAGE
      } else {
        const target = computerTargetIdentity(this.target.current())
        if (target.kind === COMPUTER_EXACT_TARGET_SELECTED) {
          await this.captureFollowingResult(target, result, context, signal)
        }
      }
    }
  }

  private async captureFollowingResult(
    target: ComputerSelectedExactTarget,
    result: ComputerExecutedAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<void> {
    try {
      result.capture = await this.capture(
        { action: COMPUTER_CAPTURE, pid: target.pid, windowId: target.windowId },
        context,
        signal,
      )
    } catch (error) {
      if (error instanceof Error) {
        result.captureFailure = error.message
      } else {
        result.captureFailure = COMPUTER_DISPATCH_UNKNOWN_FAILURE
      }
    }
  }
}
