import { readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { Value } from "typebox/value"
import { PI_REQUEST_LOG_MAX_BYTES, PI_REQUEST_LOG_NEWLINE, PI_REQUEST_LOG_TOO_LARGE } from "../request-log"
import { SELECTION_LOG } from "./constants"
import { SELECTION_REQUESTS_SCHEMA } from "./schemas"
import { type SelectionRequest } from "./types"

export function readSelectionRequests(directory: string): SelectionRequest[] {
  const path = join(directory, SELECTION_LOG)
  if (statSync(path).size > PI_REQUEST_LOG_MAX_BYTES) {
    throw new Error(PI_REQUEST_LOG_TOO_LARGE)
  }
  return readFileSync(path, "utf8").trim().split(PI_REQUEST_LOG_NEWLINE).map(parseSelectionRequest)
}

function parseSelectionRequest(line: string): SelectionRequest {
  return Value.Parse(SELECTION_REQUESTS_SCHEMA, JSON.parse(line))
}
