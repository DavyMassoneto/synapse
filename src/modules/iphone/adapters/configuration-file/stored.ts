import { closeSync, fstatSync, openSync, readSync } from "node:fs"
import { Value } from "typebox/value"
import { type IphoneConfiguration } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_CONFIG_ERROR,
  IPHONE_CONFIG_INVALID,
  IPHONE_CONFIG_LOADED,
  IPHONE_CONFIG_MAX_BYTES,
  IPHONE_CONFIG_MISSING,
  IPHONE_CONFIG_NOT_FOUND,
  IPHONE_CONFIG_READ_MODE,
  IPHONE_CONFIG_TOO_LARGE,
} from "./constants"
import { IPHONE_ANY_CONFIGURATION_SCHEMA, IPHONE_CONFIG_ERROR_CAUSE_SCHEMA } from "./schemas"
import { type IphoneStoredConfigResult, type IphoneStoredConfiguration } from "./types"

function migrateIphoneConfiguration(parsed: IphoneConfiguration): IphoneStoredConfiguration {
  const { target, ...options } = parsed
  const config: IphoneStoredConfiguration = {
    ...options,
    target: target.kind,
    deviceName: target.deviceName,
    wdaInstalled: target.wdaInstalled,
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
  if (parsed.target && typeof parsed.target === "object") {
    return {
      kind: IPHONE_CONFIG_LOADED,
      config: migrateIphoneConfiguration({ ...parsed, target: parsed.target }),
    }
  }
  return { kind: IPHONE_CONFIG_LOADED, config: parsed }
}

function readIphoneConfigBytes(path: string): IphoneStoredConfigResult {
  const descriptor = openSync(path, IPHONE_CONFIG_READ_MODE)
  try {
    if (fstatSync(descriptor).size > IPHONE_CONFIG_MAX_BYTES) {
      return { kind: IPHONE_CONFIG_INVALID, message: IPHONE_CONFIG_TOO_LARGE }
    }
    const bytes = Buffer.alloc(IPHONE_CONFIG_MAX_BYTES + 1)
    let count = 0
    let read = readSync(descriptor, bytes, count, bytes.length - count, count)
    while (read > 0 && count + read < bytes.length) {
      count += read
      read = readSync(descriptor, bytes, count, bytes.length - count, count)
    }
    count += read
    if (count > IPHONE_CONFIG_MAX_BYTES) {
      return { kind: IPHONE_CONFIG_INVALID, message: IPHONE_CONFIG_TOO_LARGE }
    }
    return parseIphoneStoredConfiguration(new TextDecoder().decode(bytes.subarray(0, count)))
  } finally {
    closeSync(descriptor)
  }
}

export function readIphoneStoredConfiguration(path: string): IphoneStoredConfigResult {
  try {
    return readIphoneConfigBytes(path)
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
