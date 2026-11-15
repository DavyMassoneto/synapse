import { randomUUID } from "node:crypto"
import { accessSync, constants, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync } from "node:fs"
import { join } from "node:path"
import {
  COMPUTER_DARWIN,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  type ComputerDriverPolicy,
  type ComputerPlatform,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ARCHIVE_EXTRACTED, computerExtractArchive } from "../archive-extraction"
import {
  COMPUTER_DRIVER_ARTIFACT_MAX_BYTES,
  COMPUTER_DRIVER_ARTIFACT_REFUSED,
  computerDownloadDriverArtifact,
} from "../artifact-download"
import { computerRunCommand } from "../command-execution"
import { ComputerDriverCli } from "../driver-cli"
import {
  COMPUTER_DRIVER_BINARY_FOLDERS,
  COMPUTER_DRIVER_INSTALLATION_ABSENT,
  COMPUTER_DRIVER_INSTALLATION_CONFLICT,
  COMPUTER_DRIVER_INSTALLATION_CORRUPT,
  COMPUTER_DRIVER_INSTALLATION_REUSABLE,
  type ComputerDriverReceipt,
  computerDriverExecutablePath,
  computerExecutableDigest,
  computerVerifyDriverInstallation,
  computerWriteCurrentVersion,
  computerWriteDriverReceipt,
} from "../driver-location"
import { COMPUTER_APP_REGISTERED, computerRegisterMacosApp } from "../macos-app-registration"
import {
  COMPUTER_INSTALL_APP_DIRECTORY,
  COMPUTER_INSTALL_EXTRACTION_DIRECTORY,
  COMPUTER_INSTALL_INVALID_BINARY,
  COMPUTER_INSTALL_MANIFEST_TIMEOUT_MILLISECONDS,
  COMPUTER_INSTALL_PUBLISH_MISSING,
  COMPUTER_INSTALL_REPORTED_VERSION_DIVERGENCE,
  COMPUTER_INSTALL_SDK_DIRECTORY,
  COMPUTER_INSTALL_SINGLE_ENTRY,
  COMPUTER_INSTALL_STAGE_PREFIX,
} from "./constants"
import { type ComputerDriverInstallationRequest, type ComputerDriverReceiptPolicy } from "./types"

export async function computerInstallDriver(request: ComputerDriverInstallationRequest): Promise<string> {
  const existing = computerVerifyDriverInstallation(request.directory, request.selection)
  if (existing.kind === COMPUTER_DRIVER_INSTALLATION_REUSABLE) {
    return existing.binary
  }
  if (existing.kind !== COMPUTER_DRIVER_INSTALLATION_ABSENT) {
    throw new Error(existing.message)
  }
  await computerInstallArtifact(request)
  const published = computerVerifyDriverInstallation(request.directory, request.selection)
  if (
    published.kind === COMPUTER_DRIVER_INSTALLATION_CONFLICT ||
    published.kind === COMPUTER_DRIVER_INSTALLATION_CORRUPT
  ) {
    throw new Error(published.message)
  }
  if (published.kind === COMPUTER_DRIVER_INSTALLATION_ABSENT) {
    throw new Error(COMPUTER_INSTALL_PUBLISH_MISSING)
  }
  if (request.selection.platform === COMPUTER_DARWIN) {
    await computerRegisterApp(join(request.directory, request.selection.version, COMPUTER_INSTALL_APP_DIRECTORY))
  }
  computerWriteCurrentVersion(request.directory, request.selection.version)
  return published.binary
}

async function computerInstallArtifact(request: ComputerDriverInstallationRequest): Promise<void> {
  const stage = join(request.directory, `${COMPUTER_INSTALL_STAGE_PREFIX}${randomUUID()}`)
  mkdirSync(stage, { recursive: true })
  try {
    const extracted = await computerPrepareArtifact(stage, request)
    const binary = join(extracted, ...COMPUTER_DRIVER_BINARY_FOLDERS[request.selection.platform])
    computerRequireBinary(binary)
    await computerRequireReportedVersion(binary, request.selection.version)
    rmSync(join(extracted, COMPUTER_INSTALL_SDK_DIRECTORY), { recursive: true, force: true })
    computerWriteDriverReceipt(extracted, computerInstallationReceipt(request, binary))
    computerPublishVersion(extracted, request.directory, request.selection.version)
  } finally {
    rmSync(stage, { recursive: true, force: true })
  }
}

async function computerPrepareArtifact(stage: string, request: ComputerDriverInstallationRequest): Promise<string> {
  const selection = request.selection
  const download = await computerDownloadDriverArtifact({
    url: selection.assetUrl,
    directory: stage,
    fileName: selection.assetName,
    sha256: selection.expectedSha256,
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
  return computerExtractedRoot(extractionDirectory, request.selection.platform)
}

function computerExtractedRoot(extractionDirectory: string, platform: ComputerPlatform): string {
  if (existsSync(join(extractionDirectory, ...COMPUTER_DRIVER_BINARY_FOLDERS[platform]))) {
    return extractionDirectory
  }
  const entries = readdirSync(extractionDirectory)
  const [single] = entries
  if (
    entries.length === COMPUTER_INSTALL_SINGLE_ENTRY &&
    single &&
    statSync(join(extractionDirectory, single)).isDirectory()
  ) {
    return join(extractionDirectory, single)
  }
  return extractionDirectory
}

function computerPublishVersion(extracted: string, directory: string, version: string): void {
  const versionDirectory = join(directory, version)
  if (!existsSync(versionDirectory)) {
    try {
      renameSync(extracted, versionDirectory)
    } catch (error) {
      if (!existsSync(versionDirectory)) {
        throw error
      }
    }
  }
}

function computerInstallationReceipt(
  request: ComputerDriverInstallationRequest,
  binary: string,
): ComputerDriverReceipt {
  const selection = request.selection
  return {
    version: selection.version,
    tag: selection.tag,
    releaseId: selection.releaseId,
    assetName: selection.assetName,
    expectedSha256: selection.expectedSha256,
    checksumSource: selection.checksumSource,
    platform: selection.platform,
    architecture: selection.architecture,
    executable: computerDriverExecutablePath(selection.platform),
    executableSha256: computerExecutableDigest(binary),
    policy: computerReceiptPolicy(request.policy),
  }
}

export function computerReceiptPolicy(policy: ComputerDriverPolicy): ComputerDriverReceiptPolicy {
  if (policy.mode === COMPUTER_DRIVER_POLICY_MODE_PINNED) {
    return { mode: policy.mode, reason: policy.reason }
  }
  return { mode: policy.mode }
}

async function computerRequireReportedVersion(binary: string, version: string): Promise<void> {
  const manifest = await new ComputerDriverCli({
    command: binary,
    arguments: [],
    environment: process.env,
    timeoutMilliseconds: COMPUTER_INSTALL_MANIFEST_TIMEOUT_MILLISECONDS,
    windowsHide: true,
  }).manifest()
  if (manifest.binary_version !== version) {
    throw new Error(
      `${COMPUTER_INSTALL_REPORTED_VERSION_DIVERGENCE} reportada ${manifest.binary_version}, selecionada ${version}.`,
    )
  }
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
