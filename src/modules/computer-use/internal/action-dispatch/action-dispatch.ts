import {
  COMPUTER_CAPTURE,
  COMPUTER_CAPTURED,
  COMPUTER_COMPLETED,
  COMPUTER_EXECUTED,
  COMPUTER_FOCUS_APP,
  COMPUTER_LIST_APPS,
  COMPUTER_LIST_WINDOWS,
  COMPUTER_REFUSED,
  COMPUTER_UNCONFIRMED,
  COMPUTER_WAIT,
  type ComputerAction,
  type ComputerCaptureAction,
  type ComputerCaptureStoragePort,
  type ComputerDriverPort,
  type ComputerDriverTool,
  type ComputerExecutedAction,
  type ComputerExecuteResult,
  type ComputerExecutionContext,
  type ComputerPlatform,
  type ComputerRenderedScreenshot,
  type ComputerWaitPort,
} from "#synapse/modules/computer-use/public/contracts"
import { ComputerCaptureRenderer, computerPublicCapture } from "../capture-rendering"
import { COMPUTER_SESSION_NATIVE_FOCUS_TOOL } from "../driver-session"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  COMPUTER_TARGET_REJECTED,
  ComputerStickyWindowTarget,
  computerTargetIdentity,
} from "../window-targeting"
import { ComputerCaptureDispatch } from "./capture-dispatch"
import { computerConfirmedExecution } from "./confirmed-envelope"
import {
  COMPUTER_DISPATCH_BRING_PROPERTY,
  COMPUTER_DISPATCH_FOCUS_MESSAGE,
  COMPUTER_DISPATCH_TOKEN_PROPERTY,
  COMPUTER_DISPATCH_UNSUPPORTED_FOCUS,
  COMPUTER_FOCUS_UNNEEDED,
  COMPUTER_PREPARED_TARGET_ELEMENT,
} from "./constants"
import { computerDispatchJudgment } from "./convert-result"
import { computerDispatchFailure } from "./dispatch-executed"
import { computerPrepareDelivery } from "./prepare-delivery"
import { computerPrepareTargetedInput } from "./prepare-targeted-input"
import { computerDispatchList, computerDispatchWait } from "./read-dispatch"
import {
  type ComputerDispatchPreparedInput,
  type ComputerFocusDecision,
  type ComputerInputAction,
  type ComputerSnapshotTokens,
} from "./types"

export class ComputerActionDispatch {
  private readonly driver: ComputerDriverPort

  private readonly platform: ComputerPlatform

  private readonly wait: ComputerWaitPort

  private readonly target = new ComputerStickyWindowTarget()

  private readonly renderer: ComputerCaptureRenderer

  private readonly capture: ComputerCaptureDispatch

  private tools: ComputerDriverTool[] = []

  private readonly snapshotTokens: ComputerSnapshotTokens = new Map()

  constructor(
    driver: ComputerDriverPort,
    platform: ComputerPlatform,
    wait: ComputerWaitPort,
    storage: ComputerCaptureStoragePort,
  ) {
    this.driver = driver
    this.platform = platform
    this.wait = wait
    this.renderer = new ComputerCaptureRenderer(storage)
    this.capture = new ComputerCaptureDispatch(driver, this.target, platform)
  }

  async execute(action: ComputerAction, context: ComputerExecutionContext): Promise<ComputerExecuteResult> {
    try {
      this.tools = await this.driver.start()
      return await this.dispatch(action, context)
    } catch (error) {
      this.target.clear()
      throw error
    }
  }

  async stop(): Promise<void> {
    this.target.clear()
    this.renderer.reset()
    await this.driver.stop()
  }

  private async dispatch(action: ComputerAction, context: ComputerExecutionContext): Promise<ComputerExecuteResult> {
    switch (action.action) {
      case COMPUTER_CAPTURE:
        return { kind: COMPUTER_CAPTURED, capture: await this.captureTarget(action, context) }
      case COMPUTER_LIST_APPS:
      case COMPUTER_LIST_WINDOWS:
        return computerDispatchList(this.driver, action, this.target)
      case COMPUTER_WAIT:
        return computerDispatchWait(this.wait, action)
      case COMPUTER_FOCUS_APP:
        await this.capture.select({ action: COMPUTER_CAPTURE, app: action.app })
        if (action.raiseWindow) {
          return this.focus(action)
        }
        return computerConfirmedExecution(action, COMPUTER_DISPATCH_FOCUS_MESSAGE)
      default:
        return this.input(action, context)
    }
  }

  private async focus(action: ComputerAction): Promise<ComputerExecuteResult> {
    const target = computerTargetIdentity(this.target.current())
    if (
      target.kind !== COMPUTER_EXACT_TARGET_SELECTED ||
      !this.tools.some((tool) => tool.name === COMPUTER_SESSION_NATIVE_FOCUS_TOOL)
    ) {
      return computerDispatchFailure(action, COMPUTER_DISPATCH_UNSUPPORTED_FOCUS, COMPUTER_REFUSED)
    }
    return computerDispatchJudgment(
      action,
      await this.driver.call(COMPUTER_SESSION_NATIVE_FOCUS_TOOL, {
        pid: target.pid,
        window_id: target.windowId,
      }),
    )
  }

  private async captureTarget(
    action: ComputerCaptureAction,
    context: ComputerExecutionContext,
  ): Promise<ComputerRenderedScreenshot> {
    const capture = await this.capture.capture(action)
    this.snapshotTokens.clear()
    for (const element of capture.elements) {
      if (element.token) {
        this.snapshotTokens.set(element.index, element.token)
      }
    }
    return computerPublicCapture(this.renderer.render(capture, context))
  }

  private attachToken(prepared: ComputerDispatchPreparedInput): void {
    const target = prepared.target
    if (target.kind === COMPUTER_PREPARED_TARGET_ELEMENT) {
      const token = this.snapshotTokens.get(target.index)
      const tool = this.tools.find((tool) => tool.name === prepared.tool)
      if (token && tool?.inputProperties.includes(COMPUTER_DISPATCH_TOKEN_PROPERTY)) {
        prepared.arguments.element_token = token
      }
    }
  }

  private async input(action: ComputerInputAction, context: ComputerExecutionContext): Promise<ComputerExecuteResult> {
    const prepared = this.prepareTargetedInput(action)
    computerPrepareDelivery(action, prepared, this.tools)
    const focusFailure = await this.focusRequested(action)
    if (focusFailure.kind !== COMPUTER_FOCUS_UNNEEDED) {
      return focusFailure
    }
    this.attachToken(prepared)
    const result = computerDispatchJudgment(action, await this.driver.call(prepared.tool, prepared.arguments))
    await this.captureAfter(action, result, context)
    return result
  }

  private prepareTargetedInput(action: ComputerInputAction): ComputerDispatchPreparedInput {
    const mismatch = this.target.inputTarget(action.app)
    if (mismatch.kind === COMPUTER_TARGET_REJECTED) {
      throw new Error(mismatch.message)
    }
    return computerPrepareTargetedInput(action, this.target.current(), this.platform)
  }

  private async focusRequested(action: ComputerInputAction): Promise<ComputerFocusDecision> {
    if (COMPUTER_DISPATCH_BRING_PROPERTY in action && action.bringToFront) {
      const focused = await this.focus(action)
      if (focused.kind === COMPUTER_EXECUTED && focused.result.kind !== COMPUTER_COMPLETED) {
        return focused
      }
    }
    return { kind: COMPUTER_FOCUS_UNNEEDED }
  }

  private async captureAfter(
    action: ComputerInputAction,
    result: ComputerExecutedAction,
    context: ComputerExecutionContext,
  ): Promise<void> {
    const target = computerTargetIdentity(this.target.current())
    if (
      action.captureAfter &&
      (result.result.kind === COMPUTER_COMPLETED || result.result.kind === COMPUTER_UNCONFIRMED) &&
      target.kind === COMPUTER_EXACT_TARGET_SELECTED
    ) {
      result.capture = await this.captureTarget(
        { action: COMPUTER_CAPTURE, pid: target.pid, windowId: target.windowId },
        context,
      )
    }
  }
}
