import { type IphoneHost } from "#synapse/modules/iphone/public/contracts"

export interface IphoneAppiumProvisionRequest {
  stateDirectory: string
  path: string
  host: IphoneHost
  appiumHome?: string
}

export interface IphoneAppiumInstallation {
  executable: string
  appiumHome?: string
}

export interface IphoneAppiumProvisionCommand {
  executable: string
  arguments: string[]
  directory: string
  environment: NodeJS.ProcessEnv
  signal: AbortSignal
}

export interface IphoneAppiumProvisionOutput {
  stdout: string
  stderr: string
}

export type IphoneAppiumProvisionExecutor = (
  command: IphoneAppiumProvisionCommand,
) => Promise<IphoneAppiumProvisionOutput>

export interface IphoneAppiumProvisionLayout {
  root: string
  active: string
  installation: string
  home: string
  executable: string
  configuration: string
  globalConfiguration: string
}

export type IphoneProvisionResolve = (output: IphoneAppiumProvisionOutput) => void

export type IphoneProvisionReject = (error: Error) => void

export type IphoneProvisionTimer = ReturnType<typeof setTimeout>

export interface IphoneProvisionReceiptFile {
  path: string
  digest: string
}

export interface IphoneProvisionReceipt {
  installation: string
  files: IphoneProvisionReceiptFile[]
}

export interface IphoneProvisionMissing {
  kind: "missing"
}

export interface IphoneProvisionReady {
  kind: "ready"
  receipt: IphoneProvisionReceipt
}

export type IphoneProvisionActive = IphoneProvisionMissing | IphoneProvisionReady
