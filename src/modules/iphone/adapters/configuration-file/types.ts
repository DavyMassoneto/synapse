import { type Static } from "typebox"
import { type IphoneConfiguration, type IphoneExtraCapabilities } from "#synapse/modules/iphone/public/contracts"
import {
  type IPHONE_COMPLETE_STORED_SCHEMA,
  type IPHONE_CONFIG_INVALID,
  type IPHONE_CONFIG_LOADED,
  type IPHONE_CONFIG_MISSING,
} from "./constants"

export type IphoneCompleteStoredConfiguration = Static<typeof IPHONE_COMPLETE_STORED_SCHEMA>

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
  kind: typeof IPHONE_CONFIG_LOADED
  config: IphoneStoredConfiguration
}

export type IphoneStoredConfigResult = IphoneStoredConfigLoaded | IphoneConfigMissing | IphoneConfigInvalid

export interface IphoneConfigMissing {
  kind: typeof IPHONE_CONFIG_MISSING
}

export interface IphoneConfigLoaded {
  kind: typeof IPHONE_CONFIG_LOADED
  config: IphoneConfiguration
}

export interface IphoneConfigInvalid {
  kind: typeof IPHONE_CONFIG_INVALID
  message: string
}

export type IphoneConfigReadResult = IphoneConfigMissing | IphoneConfigLoaded | IphoneConfigInvalid
