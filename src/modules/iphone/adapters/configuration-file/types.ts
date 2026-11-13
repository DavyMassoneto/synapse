import { type IphoneConfiguration, type IphoneExtraCapabilities } from "#synapse/modules/iphone/public/contracts"

export interface IphoneCompleteStoredDevice extends IphoneStoredConfiguration {
  serverUrl: string
  target: "device"
  udid: string
  deviceName: string
  wdaInstalled: boolean
}

export interface IphoneCompleteStoredSimulator extends IphoneStoredConfiguration {
  serverUrl: string
  target: "simulator"
  deviceName: string
  wdaInstalled: boolean
}

export type IphoneCompleteStoredConfiguration = IphoneCompleteStoredDevice | IphoneCompleteStoredSimulator

export interface IphoneSimulatorIdentifier {
  udid?: string
}

export interface IphoneStoredConfiguration {
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

export interface IphoneStoredConfigLoaded {
  kind: "loaded"
  config: IphoneStoredConfiguration
}

export type IphoneStoredConfigResult = IphoneStoredConfigLoaded | IphoneConfigMissing | IphoneConfigInvalid

export interface IphoneConfigMissing {
  kind: "missing"
}

export interface IphoneConfigLoaded {
  kind: "loaded"
  config: IphoneConfiguration
}

export interface IphoneConfigInvalid {
  kind: "invalid"
  message: string
}

export type IphoneConfigReadResult = IphoneConfigMissing | IphoneConfigLoaded | IphoneConfigInvalid
