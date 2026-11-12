import { readFileSync } from "node:fs"
import { Value } from "typebox/value"
import { type IphoneConfiguration } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_ANY_CONFIGURATION_SCHEMA,
  IPHONE_CONFIG_ERROR,
  IPHONE_CONFIG_ERROR_CAUSE_SCHEMA,
  IPHONE_CONFIG_INVALID,
  IPHONE_CONFIG_LOADED,
  IPHONE_CONFIG_MISSING,
  IPHONE_CONFIG_NOT_FOUND,
  IPHONE_CONFIGURATION_SCHEMA,
} from "./constants"
import { type IphoneStoredConfigResult, type IphoneStoredConfiguration } from "./types"

function migrateIphoneConfiguration(parsed: IphoneConfiguration): IphoneStoredConfiguration {
  const config: IphoneStoredConfiguration = {
    ...parsed,
    target: parsed.target.kind,
    deviceName: parsed.target.deviceName,
    wdaInstalled: parsed.target.wdaInstalled,
  }
  if (parsed.target.udid) {
    config.udid = parsed.target.udid
  }
  if (parsed.target.platformVersion) {
    config.platformVersion = parsed.target.platformVersion
  }
  if (parsed.target.wdaUrl) {
    config.wdaUrl = parsed.target.wdaUrl
  }
  return config
}

function parseIphoneStoredConfiguration(content: string): IphoneStoredConfigResult {
  const parsed = Value.Parse(IPHONE_ANY_CONFIGURATION_SCHEMA, JSON.parse(content))
  if (Value.Check(IPHONE_CONFIGURATION_SCHEMA, parsed)) {
    return { kind: IPHONE_CONFIG_LOADED, config: migrateIphoneConfiguration(parsed) }
  }
  return { kind: IPHONE_CONFIG_LOADED, config: parsed }
}

export function readIphoneStoredConfiguration(path: string): IphoneStoredConfigResult {
  try {
    return parseIphoneStoredConfiguration(new TextDecoder().decode(readFileSync(path)))
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === IPHONE_CONFIG_NOT_FOUND) {
      return { kind: IPHONE_CONFIG_MISSING }
    }
    if (error instanceof Error && Value.Check(IPHONE_CONFIG_ERROR_CAUSE_SCHEMA, error.cause)) {
      const first = error.cause.errors[0]
      if (first) {
        return { kind: IPHONE_CONFIG_INVALID, message: `${IPHONE_CONFIG_ERROR}${first.instancePath} ${first.message}` }
      }
    }
    return { kind: IPHONE_CONFIG_INVALID, message: IPHONE_CONFIG_ERROR }
  }
}
