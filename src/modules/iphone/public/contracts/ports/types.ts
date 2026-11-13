import { type IphoneMobileInfo } from "../actions"
import { type IphoneElement, type IphonePoint, type IphoneRectangle } from "../geometry"
import { type IphonePointerAction } from "../pointer"
import { type IphoneSupportResult } from "../result"
import {
  type IphoneConfiguration,
  type IphoneConfigurationChange,
  type IphoneConfigurationView,
  type IphoneHost,
  type IphoneModuleDependencies,
  type IphoneModuleDiagnosis,
  type IphoneModuleLog,
} from "../types"

export interface IphoneActionArguments {
  x?: number
  y?: number
  duration?: number
  keys?: string[]
  direction?: string
  fromX?: number
  fromY?: number
  toX?: number
  toY?: number
  bundleId?: string
  app?: string
  name?: string
  action?: string
  buttonLabel?: string
  url?: string
}

export interface IphoneDeviceActionPort {
  source(signal: AbortSignal): Promise<string>
  screenshot(signal: AbortSignal): Promise<string>
  rect(signal: AbortSignal): Promise<IphoneRectangle>
  actions(actions: IphonePointerAction[], signal: AbortSignal): Promise<void>
  mobile(script: string, args: IphoneActionArguments, signal: AbortSignal): Promise<void>
  mobileInfo(script: string, signal: AbortSignal): Promise<IphoneMobileInfo>
  activeElement(signal: AbortSignal): Promise<string>
  elementValue(id: string, text: string, signal: AbortSignal): Promise<void>
  clearElement(id: string, signal: AbortSignal): Promise<void>
  openUrl(url: string, signal: AbortSignal): Promise<void>
  getOrientation(signal: AbortSignal): Promise<string>
  setOrientation(orientation: string, signal: AbortSignal): Promise<void>
  close(signal: AbortSignal): Promise<void>
  wait(milliseconds: number, signal: AbortSignal): Promise<void>
}

export interface IphoneHomeScreenPort {
  viewport(signal: AbortSignal): Promise<IphoneRectangle>
  elements(signal: AbortSignal): Promise<IphoneElement[]>
  actions(actions: IphonePointerAction[], signal: AbortSignal): Promise<void>
  tap(point: IphonePoint, signal: AbortSignal): Promise<void>
  type(text: string, signal: AbortSignal): Promise<void>
  swipe(direction: IphoneHomeSwipeDirection, point: IphonePoint, signal: AbortSignal): Promise<void>
  wait(milliseconds: number, signal: AbortSignal): Promise<void>
}

export type IphoneHomeSwipeDirection = "left" | "right"

export interface IphoneSessionPort {
  probe(signal: AbortSignal): Promise<void>
  dispose(signal: AbortSignal): Promise<void>
}

export interface IphoneSessionFactory<S extends IphoneSessionPort> {
  create(signal: AbortSignal): Promise<S>
  stop(): Promise<void>
}

export type IphoneManagedPort = IphoneDeviceActionPort & IphoneSessionPort & IphoneSessionElements

export interface IphoneSessionElements {
  elements: IphoneElement[]
}

export interface IphoneInfrastructure {
  sessionFactory: IphoneSessionFactory<IphoneManagedPort>
  configuration(path: string, host: IphoneHost): IphoneConfiguration
  configurationView(path: string): IphoneConfigurationView
  configure(path: string, changes: IphoneConfigurationChange[]): IphoneSupportResult
  log(directory: string): IphoneModuleLog
  diagnose(
    config: IphoneConfiguration,
    dependencies: IphoneModuleDependencies,
    signal: AbortSignal,
  ): Promise<IphoneModuleDiagnosis>
  start(config: IphoneConfiguration, dependencies: IphoneModuleDependencies, signal: AbortSignal): Promise<void>
  stop(): Promise<void>
  homePort(session: IphoneManagedPort): IphoneHomeScreenPort
}
