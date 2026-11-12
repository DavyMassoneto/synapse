import { type IphoneDeviceAction, type IphoneDeviceActionOutput } from "./actions"
import {
  type IPHONE_DEVICE,
  type IPHONE_DIAGNOSIS_FAILED,
  type IPHONE_DIAGNOSIS_NOT_APPLICABLE,
  type IPHONE_DIAGNOSIS_OK,
  type IPHONE_SIMULATOR,
} from "./constants"
import { type IphoneHomeOperation, type IphoneHomeOutput } from "./home"
import { type IphoneSupportResult } from "./result"
import { type IphoneTargetedAction } from "./target"

export interface IphoneTargetCommon {
  deviceName: string
  platformVersion?: string
  wdaInstalled: boolean
  wdaUrl?: string
}

export interface IphoneDeviceTarget extends IphoneTargetCommon {
  kind: typeof IPHONE_DEVICE
  udid: string
}

export interface IphoneSimulatorTarget extends IphoneTargetCommon {
  kind: typeof IPHONE_SIMULATOR
  udid?: string
}

export type IphoneTarget = IphoneDeviceTarget | IphoneSimulatorTarget

export interface IphoneConfiguration {
  serverUrl: string
  target: IphoneTarget
  xcodeOrgId?: string
  xcodeSigningId?: string
  updatedWDABundleId?: string
  appiumHome?: string
  capabilities?: IphoneExtraCapabilities
}

export interface IphoneExtraCapabilities {
  noReset?: boolean
  newCommandTimeout?: number
  wdaLaunchTimeout?: number
  wdaConnectionTimeout?: number
  useNewWDA?: boolean
}

export type IphoneHost = "darwin" | "linux" | "win32"

export interface IphoneModuleDependencies {
  host: IphoneHost
  configPath: string
  stateDirectory: string
  path: string
  executeSimulatorCommand(signal: AbortSignal, command: string, args: string[]): Promise<IphoneSimulatorCommandOutput>
}

export interface IphoneSimulatorCommandOutput {
  stdout: string
  stderr: string
}

export interface IphoneModule {
  execute(action: IphoneDeviceAction, signal: AbortSignal): Promise<IphoneDeviceActionOutput>
  executeTargeted(request: IphoneTargetedAction, signal: AbortSignal): Promise<IphoneDeviceActionOutput>
  home(operation: IphoneHomeOperation, signal: AbortSignal): Promise<IphoneHomeOutput>
  diagnose(signal: AbortSignal): Promise<IphoneModuleDiagnosis>
  startServer(signal: AbortSignal): Promise<void>
  configuration(): IphoneConfigurationView
  configure(changes: IphoneConfigurationChange[]): IphoneSupportResult
  log(): IphoneModuleLog
  reset(signal: AbortSignal): Promise<void>
  stopServer(): Promise<void>
  shutdown(): Promise<void>
}

export interface IphoneConfigurationView {
  missing: string[]
  serverUrl?: string
  target?: string
  udid?: string
  simulator?: string
  deviceName?: string
  platformVersion?: string
  xcodeOrgId?: string
  xcodeSigningId?: string
  updatedWDABundleId?: string
  port?: number
  appiumHome?: string
  capabilities?: IphoneExtraCapabilities
  wdaInstalled?: boolean
  wdaUrl?: string
}

export interface IphoneConfigurationChange {
  key: string
  value: string
}

export interface IphoneModuleLog {
  path: string
  text: string
}

export interface IphoneModuleDiagnosis {
  server: IphoneModuleDiagnosisCheck
  target: IphoneModuleDiagnosisCheck
  simulator: IphoneModuleDiagnosisCheck
}

export interface IphoneModuleDiagnosisCheck {
  kind: IphoneModuleDiagnosisKind
  message?: string
}

export type IphoneModuleDiagnosisKind =
  | typeof IPHONE_DIAGNOSIS_OK
  | typeof IPHONE_DIAGNOSIS_FAILED
  | typeof IPHONE_DIAGNOSIS_NOT_APPLICABLE
