import { createHash } from "node:crypto"
import {
  UNIX_LAUNCHER_ARCHIVE_EXTENSION,
  UNIX_LAUNCHER_ASSET_BYTES,
  UNIX_LAUNCHER_CONTENT_LENGTH,
  UNIX_LAUNCHER_DECIMAL,
  UNIX_LAUNCHER_HASH,
  UNIX_LAUNCHER_HEX,
  UNIX_LAUNCHER_INVALID,
} from "./constants"
import { type UnixLauncherAsset } from "./types"

export async function downloadUnixLauncher(
  asset: UnixLauncherAsset,
  baseUrl: string,
  cancellation: AbortSignal,
): Promise<Buffer> {
  const response = await fetch(`${baseUrl}${asset.name}${UNIX_LAUNCHER_ARCHIVE_EXTENSION}`, {
    signal: cancellation,
  })
  if (!response.ok || !response.body) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const declared = response.headers.get(UNIX_LAUNCHER_CONTENT_LENGTH)
  if (declared && (!UNIX_LAUNCHER_DECIMAL.test(declared) || Number(declared) > UNIX_LAUNCHER_ASSET_BYTES)) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const bytes = await readUnixLauncherDownload(response.body, cancellation)
  if (createHash(UNIX_LAUNCHER_HASH).update(bytes).digest(UNIX_LAUNCHER_HEX) !== asset.archiveSha256) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  return bytes
}
async function readUnixLauncherDownload(stream: ReadableStream<Uint8Array>, signal: AbortSignal): Promise<Buffer> {
  const chunks: Buffer[] = []
  const reader = stream.getReader()
  let length = 0
  try {
    let result = await reader.read()
    while (!result.done) {
      signal.throwIfAborted()
      length += result.value.byteLength
      if (length > UNIX_LAUNCHER_ASSET_BYTES) {
        throw new Error(UNIX_LAUNCHER_INVALID)
      }
      chunks.push(Buffer.from(result.value))
      result = await reader.read()
    }
  } finally {
    await reader.cancel()
  }
  return Buffer.concat(chunks)
}
