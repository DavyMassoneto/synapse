import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { readJsonFile } from "../validated-json"
import {
  PI_PROCESS_MANIFEST_FILE,
  PI_PROCESS_PACKAGE_URL,
  PI_PROCESS_ROOT_URL,
  PI_PROCESS_SDK_PACKAGE,
} from "./constants"
import { PI_PROCESS_MANIFEST_SCHEMA, PI_PROCESS_SDK_SCHEMA } from "./schemas"

export function resolvePiProcessEntrypoint(): string[] {
  const manifest = readJsonFile(fileURLToPath(PI_PROCESS_PACKAGE_URL), PI_PROCESS_MANIFEST_SCHEMA)
  const paths: string[] = []
  for (const entrypoint of manifest.pi.extensions) {
    paths.push(resolve(fileURLToPath(PI_PROCESS_ROOT_URL), entrypoint))
  }
  return paths
}

export function resolvePiProcessExecutable(): string {
  const entrypoint = fileURLToPath(import.meta.resolve(PI_PROCESS_SDK_PACKAGE))
  const manifestPath = join(dirname(dirname(entrypoint)), PI_PROCESS_MANIFEST_FILE)
  const manifest = readJsonFile(manifestPath, PI_PROCESS_SDK_SCHEMA)
  return resolve(dirname(manifestPath), manifest.bin.pi)
}
