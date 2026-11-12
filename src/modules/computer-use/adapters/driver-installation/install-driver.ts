import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs"
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
import { computerDriverBinaryPath, computerWriteCurrentVersion } from "../driver-location"
import { COMPUTER_APP_REGISTERED, computerRegisterMacosApp } from "../macos-app-registration"
import {
  COMPUTER_INSTALL_APP_DIRECTORY,
  COMPUTER_INSTALL_DRIVER_UNSUPPORTED,
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
    await computerInstallArtifact(directory, lookup.artifact)
  }
  if (platform === COMPUTER_DARWIN) {
    await computerRegisterApp(join(directory, COMPUTER_DRIVER_ARTIFACT_VERSION, COMPUTER_INSTALL_APP_DIRECTORY))
  }
  computerWriteCurrentVersion(directory, COMPUTER_DRIVER_ARTIFACT_VERSION)
  return binary
}

async function computerInstallArtifact(directory: string, artifact: ComputerPinnedArtifact): Promise<void> {
  const download = await computerDownloadDriverArtifact({
    baseUrl: COMPUTER_DRIVER_RELEASE_BASE_URL,
    directory,
    artifact,
    maxBytes: COMPUTER_DRIVER_ARTIFACT_MAX_BYTES,
  })
  if (download.kind === COMPUTER_DRIVER_ARTIFACT_REFUSED) {
    throw new Error(download.message)
  }
  const stage = join(directory, `${COMPUTER_INSTALL_STAGE_PREFIX}${randomUUID()}`)
  mkdirSync(stage, { recursive: true })
  const extraction = await computerExtractArchive({ archive: download.archive, directory: stage }, computerRunCommand)
  rmSync(download.archive, { force: true })
  if (extraction.kind !== COMPUTER_ARCHIVE_EXTRACTED) {
    rmSync(stage, { recursive: true, force: true })
    throw new Error(extraction.message)
  }
  computerPlaceExtracted(stage, join(directory, COMPUTER_DRIVER_ARTIFACT_VERSION))
}

function computerPlaceExtracted(stage: string, versionDirectory: string): void {
  const extracted = computerExtractedRoot(stage)
  computerReplaceVersion(versionDirectory, extracted)
  computerRemoveExtras(stage, versionDirectory)
}

function computerExtractedRoot(stage: string): string {
  const entries = readdirSync(stage)
  const [single] = entries
  if (entries.length === COMPUTER_INSTALL_SINGLE_ENTRY && single && statSync(join(stage, single)).isDirectory()) {
    return join(stage, single)
  }
  return stage
}

function computerReplaceVersion(versionDirectory: string, extracted: string): void {
  rmSync(versionDirectory, { recursive: true, force: true })
  renameSync(extracted, versionDirectory)
}

function computerRemoveExtras(stage: string, versionDirectory: string): void {
  rmSync(stage, { recursive: true, force: true })
  rmSync(join(versionDirectory, COMPUTER_INSTALL_SDK_DIRECTORY), { recursive: true, force: true })
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
