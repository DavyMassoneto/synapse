import {
  COMPUTER_DRIVER_RESPONSE,
  type ComputerCapture,
  type ComputerCaptureAction,
  type ComputerDriverArguments,
  type ComputerDriverEnvelope,
  type ComputerDriverPort,
  type ComputerDriverTool,
  type ComputerPlatform,
  type ComputerWindow,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_TARGET_APP,
  COMPUTER_TARGET_EXACT,
  COMPUTER_TARGET_REJECTED,
  COMPUTER_TARGET_WINDOW,
  COMPUTER_WINDOW_TARGET_NOT_FOUND,
  type ComputerStickyWindowTarget,
  type ComputerTargetSelection,
} from "../window-targeting"
import { computerCaptureTargetRequest } from "./capture-target-request"
import { COMPUTER_DISPATCH_LIST_APPS, COMPUTER_DISPATCH_LIST_WINDOWS } from "./constants"
import { computerCaptureFromEnvelope, computerPrepareCapture } from "./prepare-capture"
import { computerRequireEnvelope } from "./require-envelope"

export class ComputerCaptureDispatch {
  private readonly driver: ComputerDriverPort

  private readonly target: ComputerStickyWindowTarget

  private readonly platform: ComputerPlatform

  constructor(driver: ComputerDriverPort, target: ComputerStickyWindowTarget, platform: ComputerPlatform) {
    this.driver = driver
    this.target = target
    this.platform = platform
  }

  async capture(
    action: ComputerCaptureAction,
    tools: ComputerDriverTool[],
    signal?: AbortSignal,
  ): Promise<ComputerCapture> {
    const selection = await this.select(action, signal)
    const prepared = computerPrepareCapture(action, selection, tools)
    const envelope = await this.readState(prepared.tool, prepared.arguments, signal)
    return computerCaptureFromEnvelope(prepared, envelope)
  }

  private async readState(
    tool: string,
    argumentsValue: ComputerDriverArguments,
    signal?: AbortSignal,
  ): Promise<ComputerDriverEnvelope> {
    const response = await this.driver.call(tool, argumentsValue, signal)
    return computerRequireEnvelope(response, this.target)
  }

  async select(action: ComputerCaptureAction, signal?: AbortSignal): Promise<ComputerTargetSelection> {
    const request = computerCaptureTargetRequest(action)
    if (request.kind === COMPUTER_TARGET_EXACT) {
      return this.target.select([], [], request, this.platform)
    }
    const onScreenOnly = request.kind !== COMPUTER_TARGET_WINDOW
    const response = await this.driver.call(COMPUTER_DISPATCH_LIST_WINDOWS, { on_screen_only: onScreenOnly }, signal)
    const envelope = computerRequireEnvelope(response, this.target)
    if (request.kind === COMPUTER_TARGET_WINDOW) {
      return this.selectWindow(envelope.windows, request.windowId)
    }
    let applications = envelope.applications
    if (request.kind === COMPUTER_TARGET_APP) {
      const apps = await this.driver.call(COMPUTER_DISPATCH_LIST_APPS, {}, signal)
      if (apps.kind === COMPUTER_DRIVER_RESPONSE && !apps.envelope.isError) {
        applications = apps.envelope.applications
      }
    }
    return this.target.select(envelope.windows, applications, request, this.platform)
  }

  private selectWindow(windows: ComputerWindow[], windowId: number): ComputerTargetSelection {
    const found = windows.find((window) => window.windowId === windowId)
    if (!found) {
      return { kind: COMPUTER_TARGET_REJECTED, message: COMPUTER_WINDOW_TARGET_NOT_FOUND }
    }
    return this.target.select(windows, [], { kind: COMPUTER_TARGET_EXACT, pid: found.pid, windowId }, this.platform)
  }
}
