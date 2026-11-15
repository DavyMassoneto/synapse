import { readSync } from "node:fs"
import { Value } from "typebox/value"
import {
  UNIX_KEEPER_CONTROL_FD,
  UNIX_KEEPER_CONTROL_RELEASE,
  UNIX_KEEPER_INCOMPLETE_FRAME,
  UNIX_KEEPER_LENGTH_BYTES,
  UNIX_KEEPER_MAX_SPEC_BYTES,
} from "./constants"
import { UNIX_KEEPER_SPEC_SCHEMA } from "./schemas"
import { type UnixKeeperWireSpec } from "./types"

export function readKeeperSpec(): UnixKeeperWireSpec {
  const header = Buffer.alloc(UNIX_KEEPER_LENGTH_BYTES)
  readKeeperBytes(header)
  const size = header.readUInt32BE()
  if (size > UNIX_KEEPER_MAX_SPEC_BYTES) {
    throw new Error(UNIX_KEEPER_INCOMPLETE_FRAME)
  }
  const body = Buffer.alloc(size)
  readKeeperBytes(body)
  return Value.Parse(UNIX_KEEPER_SPEC_SCHEMA, JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)))
}

export function awaitKeeperRelease(): void {
  const gate = Buffer.alloc(1)
  readKeeperBytes(gate)
  if (gate[0] !== UNIX_KEEPER_CONTROL_RELEASE) {
    throw new Error(UNIX_KEEPER_INCOMPLETE_FRAME)
  }
}

function readKeeperBytes(buffer: Buffer): void {
  let offset = 0
  while (offset < buffer.length) {
    const count = readSync(UNIX_KEEPER_CONTROL_FD, buffer, offset, buffer.length - offset, null)
    if (!count) {
      throw new Error(UNIX_KEEPER_INCOMPLETE_FRAME)
    }
    offset += count
  }
}
