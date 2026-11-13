import { closeSync, existsSync, openSync, readSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { Value } from "typebox/value"
import { PI_COMPUTER_DRIVER_CONFIGURATION_FILE } from "#synapse/integration"
import { type PiProcessScenarioHandle } from "../pi-process"
import { type PiProcessRequestLog } from "../request-log"
import {
  COMPUTER_MOUNT_DRIVER_FILE,
  COMPUTER_MOUNT_IMPORT_FLAG,
  COMPUTER_MOUNT_LOG_FILE,
  COMPUTER_MOUNT_LOG_MAX_BYTES,
  COMPUTER_MOUNT_LOG_READ_FLAG,
  COMPUTER_MOUNT_LOG_TOO_LARGE,
  COMPUTER_MOUNT_NEWLINE,
  COMPUTER_MOUNT_RESULT_MISSING,
  COMPUTER_MOUNT_TSX,
  COMPUTER_MOUNT_UTF8,
} from "./constants"
import { isComputerMountText, isComputerMountToolResult } from "./predicates"
import { COMPUTER_MOUNT_EVENT_SCHEMA } from "./schemas"
import { type ComputerMountEvent } from "./types"

export function configureComputerMountDriver(pi: PiProcessScenarioHandle): string {
  const log = join(pi.homeDirectory.home, COMPUTER_MOUNT_LOG_FILE)
  writeFileSync(
    join(pi.homeDirectory.agentDirectory, PI_COMPUTER_DRIVER_CONFIGURATION_FILE),
    JSON.stringify({
      command: process.execPath,
      arguments: [
        COMPUTER_MOUNT_IMPORT_FLAG,
        import.meta.resolve(COMPUTER_MOUNT_TSX),
        fileURLToPath(new URL(COMPUTER_MOUNT_DRIVER_FILE, import.meta.url)),
        log,
      ],
    }),
  )
  return log
}

export function readComputerMountEvents(path: string): ComputerMountEvent[] {
  if (!existsSync(path)) {
    return []
  }
  const descriptor = openSync(path, COMPUTER_MOUNT_LOG_READ_FLAG)
  const buffer = Buffer.alloc(COMPUTER_MOUNT_LOG_MAX_BYTES + 1)
  let bytes = 0
  try {
    let count = readSync(descriptor, buffer, bytes, buffer.length - bytes, null)
    while (count > 0) {
      bytes += count
      if (bytes > COMPUTER_MOUNT_LOG_MAX_BYTES) {
        throw new Error(COMPUTER_MOUNT_LOG_TOO_LARGE)
      }
      count = readSync(descriptor, buffer, bytes, buffer.length - bytes, null)
    }
  } finally {
    closeSync(descriptor)
  }
  return buffer
    .toString(COMPUTER_MOUNT_UTF8, 0, bytes)
    .trimEnd()
    .split(COMPUTER_MOUNT_NEWLINE)
    .map(parseComputerMountEvent)
}

function parseComputerMountEvent(line: string): ComputerMountEvent {
  return Value.Parse(COMPUTER_MOUNT_EVENT_SCHEMA, JSON.parse(line))
}

export function computerMountToolResultText(request: PiProcessRequestLog): string {
  const message = request.messages.findLast(isComputerMountToolResult)
  if (message && typeof message.content !== "string") {
    const block = message.content.find(isComputerMountText)
    if (block?.text) {
      return block.text
    }
  }
  throw new Error(COMPUTER_MOUNT_RESULT_MISSING)
}
