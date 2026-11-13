import {
  type IphoneActionArguments,
  type IphoneDeviceActionPort,
} from "#synapse/modules/iphone/internal/device-actions"
import { type IphonePointerAction } from "#synapse/modules/iphone/internal/pointer-gestures"
import { type IphoneMobileInfo, type IphoneRectangle } from "#synapse/modules/iphone/public/contracts"

export class DeviceActionsPort implements IphoneDeviceActionPort {
  calls: string[] = []

  args: IphoneActionArguments[] = []

  pointerActions: IphonePointerAction[] = []

  sourceText = "<root/>"

  failure?: Error

  failureScript?: string

  async source(): Promise<string> {
    this.calls.push("source")
    return this.sourceText
  }

  async screenshot(): Promise<string> {
    this.calls.push("screenshot")
    return "image"
  }

  async rect(): Promise<IphoneRectangle> {
    this.calls.push("rect")
    return { x: 0, y: 0, width: 400, height: 800 }
  }

  async actions(actions: IphonePointerAction[]): Promise<void> {
    this.pointerActions = actions
    this.calls.push("actions")
  }

  async mobile(script: string, args: IphoneActionArguments): Promise<void> {
    this.calls.push(script)
    this.args.push(args)
    if (this.failure && (!this.failureScript || this.failureScript === script)) {
      throw this.failure
    }
  }

  async mobileInfo(script: string): Promise<IphoneMobileInfo> {
    this.calls.push(script)
    return { name: "fake" }
  }

  async activeElement(): Promise<string> {
    this.calls.push("activeElement")
    return "element"
  }

  async elementValue(_id: string, _text: string): Promise<void> {
    this.calls.push("elementValue")
  }

  async clearElement(): Promise<void> {
    this.calls.push("clearElement")
  }

  async openUrl(): Promise<void> {
    this.calls.push("openUrl")
  }

  async getOrientation(): Promise<string> {
    this.calls.push("getOrientation")
    return "PORTRAIT"
  }

  async setOrientation(): Promise<void> {
    this.calls.push("setOrientation")
  }

  async close(): Promise<void> {
    this.calls.push("close")
  }

  async wait(milliseconds: number, _signal: AbortSignal): Promise<void> {
    this.calls.push(`wait:${milliseconds}`)
  }
}
