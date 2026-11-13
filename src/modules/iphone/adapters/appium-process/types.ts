export interface IphoneAppiumStarted {
  kind: "started"
}

export interface IphoneAppiumRemote {
  kind: "remote"
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
