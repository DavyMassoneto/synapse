import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { Value } from "typebox/value"
import {
  PI_REQUEST_LOG_ENCODING,
  PI_REQUEST_LOG_FILE,
  PI_REQUEST_LOG_NEWLINE,
  PI_REQUEST_LOG_SCHEMA,
} from "./constants"
import { type PiProcessRequestLog } from "./types"

export function readPiProcessRequests(home: string): PiProcessRequestLog[] {
  const path = join(home, PI_REQUEST_LOG_FILE)
  if (!existsSync(path)) {
    return []
  }
  const lines = readFileSync(path, PI_REQUEST_LOG_ENCODING).trimEnd().split(PI_REQUEST_LOG_NEWLINE)
  return lines.map((line) => Value.Parse(PI_REQUEST_LOG_SCHEMA, JSON.parse(line)))
}
