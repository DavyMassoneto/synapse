import { randomUUID } from "node:crypto"
import { accessSync, constants, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"
import { COMPUTER_DARWIN, type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ARCHIVE_EXTRACTED, computerExtractArchive } from "../archive-extraction"
import {
  COMPUTER_ARTIFACT_ABSENT,
  COMPUTER_DRIVER_ARTIFACT_MAX_BYTES,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
  COMPUTER_DRIVER_ARTIFACT_VERSION,
  COMPUTER_DRIVER_RELEASE_BASE_URL,
  type ComputerPinnedArtifact,
  computerDownloadDriverArtifact,
  computerPinnedArtifact,
} from "../artifact-download"
import { computerRunCommand } from "../command-execution"
import {
  COMPUTER_DRIVER_BINARY_FOLDERS,
  computerDriverBinaryPath,
  computerWriteCurrentVersion,
} from "../driver-location"
import { COMPUTER_APP_REGISTERED, computerRegisterMacosApp } from "../macos-app-registration"
import {
  COMPUTER_INSTALL_APP_DIRECTORY,
  COMPUTER_INSTALL_DESTINATION_CONFLICT,
  COMPUTER_INSTALL_DRIVER_UNSUPPORTED,
  COMPUTER_INSTALL_EXTRACTION_DIRECTORY,
  COMPUTER_INSTALL_INVALID_BINARY,
  COMPUTER_INSTALL_SDK_DIRECTORY,
  COMPUTER_INSTALL_SINGLE_ENTRY,
  COMPUTER_INSTALL_STAGE_PREFIX,
} from "./constants"

export async function computerInstallDriver(
  directory: string,
  platform: ComputerPlatform,
  architecture: string,
): Promise<string> {
  const lookup = computerPinnedArtifact(platform, architecture)
  if (lookup.kind === COMPUTER_ARTIFACT_ABSENT) {
    throw new Error(`${COMPUTER_INSTALL_DRIVER_UNSUPPORTED} ${platform}-${architecture}.`)
  }
  const binary = computerDriverBinaryPath(directory, platform, COMPUTER_DRIVER_ARTIFACT_VERSION)
  if (!existsSync(binary)) {
    const versionDirectory = join(directory, COMPUTER_DRIVER_ARTIFACT_VERSION)
    if (existsSync(versionDirectory)) {
      computerRequirePublishedBinary(directory, platform)
    }
    await computerInstallArtifact(directory, platform, lookup.artifact)
  }
  computerRequireBinary(binary)
  if (platform === COMPUTER_DARWIN) {
    await computerRegisterApp(join(directory, COMPUTER_DRIVER_ARTIFACT_VERSION, COMPUTER_INSTALL_APP_DIRECTORY))
  }
  computerWriteCurrentVersion(directory, COMPUTER_DRIVER_ARTIFACT_VERSION)
  return binary
}

async function computerInstallArtifact(
  directory: string,
  platform: ComputerPlatform,
  artifact: ComputerPinnedArtifact,
): Promise<void> {
  const stage = join(directory, `${COMPUTER_INSTALL_STAGE_PREFIX}${randomUUID()}`)
  mkdirSync(stage, { recursive: true })
  try {
    const extracted = await computerPrepareArtifact(stage, platform, artifact)
    computerRequireBinary(join(extracted, ...COMPUTER_DRIVER_BINARY_FOLDERS[platform]))
    rmSync(join(extracted, COMPUTER_INSTALL_SDK_DIRECTORY), { recursive: true, force: true })
    computerPublishVersion(extracted, directory, platform)
  } finally {
    rmSync(stage, { recursive: true, force: true })
  }
}

async function computerPrepareArtifact(
  stage: string,
  platform: ComputerPlatform,
  artifact: ComputerPinnedArtifact,
): Promise<string> {
  const download = await computerDownloadDriverArtifact({
    baseUrl: COMPUTER_DRIVER_RELEASE_BASE_URL,
    directory: stage,
    artifact,
    maxBytes: COMPUTER_DRIVER_ARTIFACT_MAX_BYTES,
  })
  if (download.kind === COMPUTER_DRIVER_ARTIFACT_REFUSED) {
    throw new Error(download.message)
  }
  const extractionDirectory = join(stage, COMPUTER_INSTALL_EXTRACTION_DIRECTORY)
  mkdirSync(extractionDirectory)
  const extraction = await computerExtractArchive(
    { archive: download.archive, directory: extractionDirectory },
    computerRunCommand,
  )
  if (extraction.kind !== COMPUTER_ARCHIVE_EXTRACTED) {
    throw new Error(extraction.message)
  }
  return computerExtractedRoot(extractionDirectory, platform)
}

function computerExtractedRoot(stage: string, platform: ComputerPlatform): string {
  if (existsSync(join(stage, ...COMPUTER_DRIVER_BINARY_FOLDERS[platform]))) {
    return stage
  }
  const entries = readdirSync(stage)
  const [single] = entries
  if (entries.length === COMPUTER_INSTALL_SINGLE_ENTRY && single && statSync(join(stage, single)).isDirectory()) {
    return join(stage, single)
  }
  return stage
}

function computerPublishVersion(extracted: string, directory: string, platform: ComputerPlatform): void {
  const versionDirectory = join(directory, COMPUTER_DRIVER_ARTIFACT_VERSION)
  if (existsSync(versionDirectory)) {
    computerRequirePublishedBinary(directory, platform)
  } else {
    try {
      renameSync(extracted, versionDirectory)
    } catch (error) {
      if (existsSync(versionDirectory)) {
        computerRequirePublishedBinary(directory, platform)
      } else {
        throw error
      }
    }
  }
}

function computerRequirePublishedBinary(directory: string, platform: ComputerPlatform): void {
  const binary = computerDriverBinaryPath(directory, platform, COMPUTER_DRIVER_ARTIFACT_VERSION)
  if (!existsSync(binary)) {
    throw new Error(COMPUTER_INSTALL_DESTINATION_CONFLICT)
  }
  computerRequireBinary(binary)
}

function computerRequireBinary(binary: string): void {
  if (!existsSync(binary)) {
    throw new Error(COMPUTER_INSTALL_INVALID_BINARY)
  }
  const status = statSync(binary)
  if (!status.isFile() || status.size === 0) {
    throw new Error(COMPUTER_INSTALL_INVALID_BINARY)
  }
  accessSync(binary, constants.X_OK)
}

async function computerRegisterApp(appDirectory: string): Promise<void> {
  const registration = await computerRegisterMacosApp({
    platform: COMPUTER_DARWIN,
    appDirectory,
    executor: computerRunCommand,
  })
  if (registration.kind !== COMPUTER_APP_REGISTERED) {
    throw new Error(registration.message)
  }
}
