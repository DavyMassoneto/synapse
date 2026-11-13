import { randomUUID } from "node:crypto"
import { chmodSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import {
  COMPUTER_CAPTURE_NOT_STORED,
  COMPUTER_CAPTURE_STORED,
  COMPUTER_WIN32,
  type ComputerCapture,
  type ComputerCaptureStoragePort,
  type ComputerCaptureStorageResult,
  type ComputerPlatform,
  type ComputerPresentImage,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_CAPTURE_FILE_DIRECTORY_MODE,
  COMPUTER_CAPTURE_FILE_ELEMENTS_EXTENSION,
  COMPUTER_CAPTURE_FILE_ELEMENTS_PREFIX,
  COMPUTER_CAPTURE_FILE_END,
  COMPUTER_CAPTURE_FILE_IMAGE_ENCODING,
  COMPUTER_CAPTURE_FILE_IMAGE_EXTENSIONS,
  COMPUTER_CAPTURE_FILE_IMAGE_PREFIX,
  COMPUTER_CAPTURE_FILE_INDENT,
  COMPUTER_CAPTURE_FILE_MODE,
  COMPUTER_CAPTURE_FILE_ROTATION_LIMIT,
  COMPUTER_CAPTURE_FILE_STORE_FAILED,
} from "./constants"
import { type ComputerCaptureFileData, type ComputerCaptureFileEntry } from "./types"

export class ComputerCaptureFiles implements ComputerCaptureStoragePort {
  private readonly directory: string

  private readonly platform: ComputerPlatform

  constructor(directory: string, platform: ComputerPlatform) {
    this.directory = directory
    this.platform = platform
  }

  storeImage(image: ComputerPresentImage): ComputerCaptureStorageResult {
    const extension = COMPUTER_CAPTURE_FILE_IMAGE_EXTENSIONS[image.mime]
    return this.store(
      COMPUTER_CAPTURE_FILE_IMAGE_PREFIX,
      extension,
      Buffer.from(image.data, COMPUTER_CAPTURE_FILE_IMAGE_ENCODING),
    )
  }

  storeElements(capture: ComputerCapture): ComputerCaptureStorageResult {
    const content = `${JSON.stringify(capture, null, COMPUTER_CAPTURE_FILE_INDENT)}${COMPUTER_CAPTURE_FILE_END}`
    return this.store(COMPUTER_CAPTURE_FILE_ELEMENTS_PREFIX, COMPUTER_CAPTURE_FILE_ELEMENTS_EXTENSION, content)
  }

  private store(prefix: string, extension: string, data: ComputerCaptureFileData): ComputerCaptureStorageResult {
    const path = join(this.directory, `${prefix}${randomUUID()}${extension}`)
    try {
      this.createDirectory()
      writeFileSync(path, data, { mode: COMPUTER_CAPTURE_FILE_MODE })
      this.restrictPermissions(path)
      this.rotate(prefix)
      return { kind: COMPUTER_CAPTURE_STORED, reference: path }
    } catch (error) {
      if (error instanceof Error) {
        return { kind: COMPUTER_CAPTURE_NOT_STORED, message: `${COMPUTER_CAPTURE_FILE_STORE_FAILED} ${error.message}` }
      }
      throw error
    }
  }

  private createDirectory(): void {
    mkdirSync(this.directory, { recursive: true, mode: COMPUTER_CAPTURE_FILE_DIRECTORY_MODE })
  }

  private restrictPermissions(path: string): void {
    if (this.platform !== COMPUTER_WIN32) {
      chmodSync(this.directory, COMPUTER_CAPTURE_FILE_DIRECTORY_MODE)
      chmodSync(path, COMPUTER_CAPTURE_FILE_MODE)
    }
  }

  private rotate(prefix: string): void {
    const entries = this.entries(prefix).sort((first, second) => second.modified - first.modified)
    for (const stale of entries.slice(COMPUTER_CAPTURE_FILE_ROTATION_LIMIT)) {
      rmSync(join(this.directory, stale.name), { force: true })
    }
  }

  private entries(prefix: string): ComputerCaptureFileEntry[] {
    return readdirSync(this.directory)
      .filter((name) => name.startsWith(prefix))
      .map((name) => ({ name, modified: statSync(join(this.directory, name)).mtimeMs }))
  }
}
