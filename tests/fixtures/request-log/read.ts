import { closeSync, existsSync, openSync, readSync } from "node:fs"
import { join } from "node:path"
import { Value } from "typebox/value"
import {
  PI_REQUEST_LOG_CHUNK_BYTES,
  PI_REQUEST_LOG_FILE,
  PI_REQUEST_LOG_MAX_BYTES,
  PI_REQUEST_LOG_MISSING_REQUEST,
  PI_REQUEST_LOG_NEWLINE,
  PI_REQUEST_LOG_READ_FLAG,
  PI_REQUEST_LOG_TOO_LARGE,
} from "./constants"
import { PI_REQUEST_LOG_SCHEMA } from "./schemas"
import { type PiProcessRequestLog } from "./types"

function parsePiProcessRequest(line: string): PiProcessRequestLog {
  return Value.Parse(PI_REQUEST_LOG_SCHEMA, JSON.parse(line))
}

export function readPiProcessRequests(home: string): PiProcessRequestLog[] {
  const path = join(home, PI_REQUEST_LOG_FILE)
  if (!existsSync(path)) {
    return []
  }
  const content = readBoundedPiRequestLog(path)
  const lines = new TextDecoder().decode(content).trimEnd().split(PI_REQUEST_LOG_NEWLINE)
  return lines.map(parsePiProcessRequest)
}

function readBoundedPiRequestLog(path: string): Buffer {
  const descriptor = openSync(path, PI_REQUEST_LOG_READ_FLAG)
  const buffer = Buffer.alloc(PI_REQUEST_LOG_CHUNK_BYTES)
  const chunks: Buffer[] = []
  let bytes = 0
  try {
    let count = readSync(descriptor, buffer, 0, buffer.length, null)
    while (count > 0) {
      bytes += count
      if (bytes > PI_REQUEST_LOG_MAX_BYTES) {
        throw new Error(PI_REQUEST_LOG_TOO_LARGE)
      }
      chunks.push(Buffer.from(buffer.subarray(0, count)))
      count = readSync(descriptor, buffer, 0, buffer.length, null)
    }
  } finally {
    closeSync(descriptor)
  }
  return Buffer.concat(chunks, bytes)
}

export function requirePiProcessRequest(requests: PiProcessRequestLog[], index: number): PiProcessRequestLog {
  const request = requests[index]
  if (request) {
    return request
  }
  throw new Error(PI_REQUEST_LOG_MISSING_REQUEST)
}
