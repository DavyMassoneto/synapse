import { closeSync, fstatSync, openSync, readSync } from "node:fs"
import { join } from "node:path"
import { IPHONE_APPIUM_LOG_FILE } from "#synapse/modules/iphone/adapters/appium-process"
import { type IphoneModuleLog } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_LOG_ENCODING,
  IPHONE_LOG_LINES,
  IPHONE_LOG_MAX_BYTES,
  IPHONE_LOG_NEWLINE,
  IPHONE_LOG_NOT_FOUND,
  IPHONE_LOG_READ_MODE,
} from "./constants"

export function readIphoneServerLog(directory: string): IphoneModuleLog {
  const path = join(directory, IPHONE_APPIUM_LOG_FILE)
  try {
    const descriptor = openSync(path, IPHONE_LOG_READ_MODE)
    try {
      const size = fstatSync(descriptor).size
      const length = Math.min(size, IPHONE_LOG_MAX_BYTES)
      const buffer = Buffer.alloc(length)
      const read = readSync(descriptor, buffer, 0, length, size - length)
      return {
        path,
        text: buffer
          .toString(IPHONE_LOG_ENCODING, 0, read)
          .split(IPHONE_LOG_NEWLINE)
          .slice(-IPHONE_LOG_LINES)
          .join(IPHONE_LOG_NEWLINE),
      }
    } finally {
      closeSync(descriptor)
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === IPHONE_LOG_NOT_FOUND) {
      return { path, text: "" }
    }
    throw error
  }
}
