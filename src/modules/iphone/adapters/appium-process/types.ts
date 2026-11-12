import { type IPHONE_APPIUM_REMOTE, type IPHONE_APPIUM_STARTED } from "./constants"

export interface IphoneAppiumStarted {
  kind: typeof IPHONE_APPIUM_STARTED
}

export interface IphoneAppiumRemote {
  kind: typeof IPHONE_APPIUM_REMOTE
}

export type IphoneAppiumStartResult = IphoneAppiumStarted | IphoneAppiumRemote

export interface IphoneAppiumSpawnCommand {
  command: string
  arguments: string[]
}

export type IphoneAppiumResolve = () => void

export type IphoneAppiumTimer = ReturnType<typeof setTimeout>

export interface IphoneAppiumCommandOutput {
  stdout: string
  stderr: string
}

export type IphoneAppiumExecutor = (command: string, argumentsValue: string[]) => Promise<IphoneAppiumCommandOutput>
