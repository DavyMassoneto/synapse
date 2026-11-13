import {
  COMPUTER_CANCELLED,
  COMPUTER_CAPTURE,
  COMPUTER_CAPTURED,
  COMPUTER_COMPLETED,
  COMPUTER_EXECUTED,
  COMPUTER_FOCUS_APP,
  COMPUTER_LIST_APPS,
  COMPUTER_LIST_WINDOWS,
  COMPUTER_REFUSED,
  COMPUTER_WAIT,
  type ComputerAction,
  type ComputerCaptureStoragePort,
  type ComputerDriverPort,
  type ComputerDriverTool,
  type ComputerExecutedAction,
  type ComputerExecuteResult,
  type ComputerExecutionContext,
  type ComputerPlatform,
  type ComputerWaitPort,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_SESSION_NATIVE_FOCUS_TOOL } from "../driver-session"
import { ComputerExecutionCancelled, computerCheckCancellation } from "../execution-cancellation"
import {
  COMPUTER_EXACT_TARGET_SELECTED,
  COMPUTER_TARGET_REJECTED,
  ComputerStickyWindowTarget,
  computerTargetIdentity,
} from "../window-targeting"
import { ComputerActionCaptures } from "./action-captures"
import { ComputerCaptureDispatch } from "./capture-dispatch"
import { computerConfirmedExecution } from "./confirmed-envelope"
import {
  COMPUTER_DISPATCH_BRING_PROPERTY,
  COMPUTER_DISPATCH_FOCUS_MESSAGE,
  COMPUTER_DISPATCH_UNSUPPORTED_FOCUS,
  COMPUTER_FOCUS_UNNEEDED,
} from "./constants"
import { computerDispatchJudgment } from "./convert-result"
import { computerDispatchFailure } from "./dispatch-executed"
import { computerPrepareDelivery } from "./prepare-delivery"
import { computerPrepareTargetedInput } from "./prepare-targeted-input"
import { computerDispatchList, computerDispatchWait } from "./read-dispatch"
import { type ComputerDispatchPreparedInput, type ComputerFocusDecision, type ComputerInputAction } from "./types"

export class ComputerActionDispatch {
  private readonly driver: ComputerDriverPort

  private readonly platform: ComputerPlatform

  private readonly wait: ComputerWaitPort

  private readonly target = new ComputerStickyWindowTarget()

  private readonly captures: ComputerActionCaptures

  private readonly capture: ComputerCaptureDispatch

  private tools: ComputerDriverTool[] = []

  private readonly lifecycle = new AbortController()

  constructor(
    driver: ComputerDriverPort,
    platform: ComputerPlatform,
    wait: ComputerWaitPort,
    storage: ComputerCaptureStoragePort,
  ) {
    this.driver = driver
    this.platform = platform
    this.wait = wait
    this.capture = new ComputerCaptureDispatch(driver, this.target, platform)
    this.captures = new ComputerActionCaptures(this.capture, this.target, storage)
  }

  async execute(
    action: ComputerAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult> {
    const operationSignal = signal ? AbortSignal.any([signal, this.lifecycle.signal]) : this.lifecycle.signal
    try {
      computerCheckCancellation(operationSignal)
      this.tools = await this.driver.start()
      computerCheckCancellation(operationSignal)
      return await this.dispatch(action, context, operationSignal)
    } catch (error) {
      this.target.clear()
      if (error instanceof ComputerExecutionCancelled) {
        return computerDispatchFailure(action, error.message, COMPUTER_CANCELLED)
      }
      throw error
    }
  }

  async stop(): Promise<void> {
    this.lifecycle.abort()
    this.target.clear()
    this.captures.reset()
    await this.driver.stop()
  }

  private async dispatch(
    action: ComputerAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult> {
    switch (action.action) {
      case COMPUTER_CAPTURE:
        return { kind: COMPUTER_CAPTURED, capture: await this.captures.capture(action, context, signal) }
      case COMPUTER_LIST_APPS:
      case COMPUTER_LIST_WINDOWS:
        return computerDispatchList(this.driver, action, this.target, signal)
      case COMPUTER_WAIT:
        return computerDispatchWait(this.wait, action, signal)
      case COMPUTER_FOCUS_APP: {
        const selection = await this.capture.select({ action: COMPUTER_CAPTURE, app: action.app }, signal)
        if (selection.kind === COMPUTER_TARGET_REJECTED) {
          return computerDispatchFailure(action, selection.message, COMPUTER_REFUSED)
        }
        computerCheckCancellation(signal)
        if (action.raiseWindow) {
          return this.focus(action, signal)
        }
        return computerConfirmedExecution(action, COMPUTER_DISPATCH_FOCUS_MESSAGE)
      }
      default:
        return this.input(action, context, signal)
    }
  }

  private async focus(action: ComputerAction, signal?: AbortSignal): Promise<ComputerExecutedAction> {
    const target = computerTargetIdentity(this.target.current())
    if (
      target.kind !== COMPUTER_EXACT_TARGET_SELECTED ||
      !this.tools.some((tool) => tool.name === COMPUTER_SESSION_NATIVE_FOCUS_TOOL)
    ) {
      return computerDispatchFailure(action, COMPUTER_DISPATCH_UNSUPPORTED_FOCUS, COMPUTER_REFUSED)
    }
    return computerDispatchJudgment(
      action,
      await this.driver.call(
        COMPUTER_SESSION_NATIVE_FOCUS_TOOL,
        { pid: target.pid, window_id: target.windowId },
        signal,
      ),
    )
  }

  private async input(
    action: ComputerInputAction,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult> {
    const prepared = this.prepareTargetedInput(action)
    computerPrepareDelivery(action, prepared, this.tools)
    const focusFailure = await this.focusRequested(action, signal)
    if (focusFailure.kind === COMPUTER_EXECUTED && focusFailure.result.kind !== COMPUTER_COMPLETED) {
      focusFailure.precedingEffects = [{ ...focusFailure.result, action: COMPUTER_FOCUS_APP }]
      return focusFailure
    }
    const result = await this.deliverInput(action, prepared, context, signal)
    if (focusFailure.kind === COMPUTER_EXECUTED) {
      result.precedingEffects = [{ ...focusFailure.result, action: COMPUTER_FOCUS_APP }]
    }
    return result
  }

  private async deliverInput(
    action: ComputerInputAction,
    prepared: ComputerDispatchPreparedInput,
    context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerExecutedAction> {
    try {
      this.captures.attachToken(prepared, this.tools)
      computerCheckCancellation(signal)
      const result = computerDispatchJudgment(action, await this.driver.call(prepared.tool, prepared.arguments, signal))
      await this.captures.after(action, result, context, signal)
      return result
    } catch (error) {
      if (error instanceof ComputerExecutionCancelled) {
        return computerDispatchFailure(action, error.message, COMPUTER_CANCELLED)
      }
      throw error
    }
  }

  private prepareTargetedInput(action: ComputerInputAction): ComputerDispatchPreparedInput {
    const mismatch = this.target.inputTarget(action.app)
    if (mismatch.kind === COMPUTER_TARGET_REJECTED) {
      throw new Error(mismatch.message)
    }
    return computerPrepareTargetedInput(action, this.target.current(), this.platform)
  }

  private async focusRequested(action: ComputerInputAction, signal?: AbortSignal): Promise<ComputerFocusDecision> {
    if (COMPUTER_DISPATCH_BRING_PROPERTY in action && action.bringToFront) {
      const focused = await this.focus(action, signal)
      return focused
    }
    return { kind: COMPUTER_FOCUS_UNNEEDED }
  }
}
