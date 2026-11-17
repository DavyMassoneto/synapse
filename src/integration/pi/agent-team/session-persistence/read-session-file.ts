import { closeSync, openSync, readSync } from "node:fs"
import { TextDecoder } from "node:util"
import {
  TEAM_PI_MEMBER_INVALID_FILE,
  TEAM_SESSION_ENCODING,
  TEAM_SESSION_READ_CHUNK_BYTES,
  TEAM_SESSION_READ_MODE,
} from "./constants"
import { TeamSessionFileParser } from "./parse-session-file"
import { type TeamSessionFileIdentity } from "./types"

export function readTeamSessionFile(path: string): TeamSessionFileIdentity {
  const parser = new TeamSessionFileParser(path)
  const decoder = new TextDecoder(TEAM_SESSION_ENCODING, { fatal: true, ignoreBOM: true })
  const buffer = Buffer.allocUnsafe(TEAM_SESSION_READ_CHUNK_BYTES)
  const descriptor = openSync(path, TEAM_SESSION_READ_MODE)
  try {
    let bytes = readSync(descriptor, buffer, 0, buffer.length, null)
    while (bytes > 0) {
      parser.consume(decodeTeamSessionChunk(decoder, buffer.subarray(0, bytes), path, true))
      bytes = readSync(descriptor, buffer, 0, buffer.length, null)
    }
    parser.consume(decodeTeamSessionChunk(decoder, new Uint8Array(0), path, false))
    return parser.finish()
  } finally {
    closeSync(descriptor)
  }
}

function decodeTeamSessionChunk(decoder: TextDecoder, bytes: Uint8Array, path: string, stream: boolean): string {
  try {
    return decoder.decode(bytes, { stream })
  } catch {
    throw new Error(TEAM_PI_MEMBER_INVALID_FILE + path)
  }
}
