import {
  COMPUTER_DRIVER_RESPONSE,
  type ComputerCapture,
  type ComputerCaptureAction,
  type ComputerDriverArguments,
  type ComputerDriverEnvelope,
  type ComputerDriverPort,
  type ComputerPlatform,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_TARGET_APP,
  COMPUTER_TARGET_EXACT,
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

  async capture(action: ComputerCaptureAction, signal?: AbortSignal): Promise<ComputerCapture> {
    const selection = await this.select(action, signal)
    const prepared = computerPrepareCapture(action, selection)
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
    const response = await this.driver.call(COMPUTER_DISPATCH_LIST_WINDOWS, { on_screen_only: true }, signal)
    const envelope = computerRequireEnvelope(response, this.target)
    let applications = envelope.applications
    if (request.kind === COMPUTER_TARGET_APP) {
      const apps = await this.driver.call(COMPUTER_DISPATCH_LIST_APPS, {}, signal)
      if (apps.kind === COMPUTER_DRIVER_RESPONSE && !apps.envelope.isError) {
        applications = apps.envelope.applications
      }
    }
    return this.target.select(envelope.windows, applications, request, this.platform)
  }
}
