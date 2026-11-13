import { mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneConfigurationChange,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_CONFIG_ENCODING,
  IPHONE_CONFIG_INVALID,
  IPHONE_CONFIG_LOADED,
  IPHONE_CONFIG_TEMP_FILE,
  IPHONE_CONFIG_TEMP_PREFIX,
  IPHONE_CONFIG_WRITE_MODE,
} from "./constants"
import { readIphoneStoredConfiguration } from "./stored"
import { updateIphoneConfiguration } from "./update"

export function writeIphoneConfiguration(path: string, changes: IphoneConfigurationChange[]): IphoneSupportResult {
  const loaded = readIphoneStoredConfiguration(path)
  if (loaded.kind === IPHONE_CONFIG_INVALID) {
    return { kind: IPHONE_REFUSED, message: loaded.message }
  }
  const config = loaded.kind === IPHONE_CONFIG_LOADED ? loaded.config : {}
  const result = updateIphoneConfiguration(config, changes)
  if (result.kind === IPHONE_REFUSED) {
    return result
  }
  const directory = dirname(path)
  mkdirSync(directory, { recursive: true })
  const temporary = mkdtempSync(join(directory, IPHONE_CONFIG_TEMP_PREFIX))
  try {
    const file = join(temporary, IPHONE_CONFIG_TEMP_FILE)
    writeFileSync(file, JSON.stringify(config, null, 2), {
      encoding: IPHONE_CONFIG_ENCODING,
      mode: IPHONE_CONFIG_WRITE_MODE,
    })
    renameSync(file, path)
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
  return { kind: IPHONE_ACCEPTED }
}
