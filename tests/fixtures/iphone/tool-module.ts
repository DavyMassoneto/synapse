import {
  type IphoneConfigurationChange,
  type IphoneConfigurationView,
  type IphoneDeviceAction,
  type IphoneDeviceActionOutput,
  type IphoneHomeOperation,
  type IphoneHomeOutput,
  type IphoneModule,
  type IphoneModuleDiagnosis,
  type IphoneModuleLog,
  type IphoneSupportResult,
  type IphoneTargetedAction,
} from "#synapse/modules"
import {
  IPHONE_FIXTURE_ACTION_RESULT,
  IPHONE_FIXTURE_IMAGE_RESULT,
  IPHONE_FIXTURE_TREE_RESULT,
  IPHONE_FIXTURE_UNEXPECTED_CALL,
} from "./constants"

export class IphoneToolModule implements IphoneModule {
  readonly actions: IphoneDeviceAction[] = []
  readonly targets: IphoneTargetedAction[] = []
  indexed = false
  failTree = false
  failScreenshot = false
  cancelScreenshot = false
  cancelTree = false

  async execute(action: IphoneDeviceAction, signal: AbortSignal): Promise<IphoneDeviceActionOutput> {
    signal.throwIfAborted()
    this.actions.push(action)
    if (action.kind === "screenshot") {
      this.indexed = false
      if (this.cancelScreenshot) {
        throw new DOMException(IPHONE_FIXTURE_UNEXPECTED_CALL, "AbortError")
      }
      if (this.failScreenshot) {
        throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
      }
      return IPHONE_FIXTURE_IMAGE_RESULT
    }
    if (action.kind === "tree") {
      if (this.cancelTree) {
        throw new DOMException(IPHONE_FIXTURE_UNEXPECTED_CALL, "AbortError")
      }
      if (this.failTree) {
        throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
      }
      this.indexed = true
      return IPHONE_FIXTURE_TREE_RESULT
    }
    return IPHONE_FIXTURE_ACTION_RESULT
  }

  async executeTargeted(request: IphoneTargetedAction, signal: AbortSignal): Promise<IphoneDeviceActionOutput> {
    signal.throwIfAborted()
    if (!this.indexed) {
      throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
    }
    this.targets.push(request)
    this.indexed = false
    return IPHONE_FIXTURE_ACTION_RESULT
  }

  async home(_operation: IphoneHomeOperation, _signal: AbortSignal): Promise<IphoneHomeOutput> {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  async diagnose(_signal: AbortSignal): Promise<IphoneModuleDiagnosis> {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  async startServer(_signal: AbortSignal): Promise<void> {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  configuration(): IphoneConfigurationView {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  configure(_changes: IphoneConfigurationChange[]): IphoneSupportResult {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  log(): IphoneModuleLog {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  async reset(_signal: AbortSignal): Promise<void> {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  async stopServer(): Promise<void> {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }

  async shutdown(): Promise<void> {
    throw new Error(IPHONE_FIXTURE_UNEXPECTED_CALL)
  }
}
