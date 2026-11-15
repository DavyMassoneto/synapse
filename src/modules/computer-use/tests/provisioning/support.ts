import { execFileSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { chmodSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { vi } from "vitest"
import {
  COMPUTER_ARCHIVE_EXTRACTED,
  type ComputerArchiveExtractionResult,
} from "#synapse/modules/computer-use/adapters/archive-extraction"
import {
  COMPUTER_INSTALL_EXTRACTION_DIRECTORY,
  computerReceiptPolicy,
} from "#synapse/modules/computer-use/adapters/driver-installation"
import {
  computerDriverExecutablePath,
  computerExecutableDigest,
  computerWriteCurrentVersion,
  computerWriteDriverReceipt,
} from "#synapse/modules/computer-use/adapters/driver-location"
import * as driverRelease from "#synapse/modules/computer-use/adapters/driver-release"
import { ComputerSystemInfrastructure } from "#synapse/modules/computer-use/adapters/system-infrastructure"
import { ComputerUseService } from "#synapse/modules/computer-use/internal/computer-session"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_LINUX,
  type ComputerDriverPolicy,
  type ComputerDriverReleaseSelection,
  type ComputerUseDependencies,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ARTIFACT_TEST_HTTP_OK } from "../artifact-download-constants"
import { computerArtifactDigest } from "../artifact-download-digest"
import { ComputerArtifactTestServer } from "../artifact-download-support"
import { ComputerTestWait } from "../doubles"
import { COMPUTER_FAKE_VERSION } from "../fake-driver"
import { computerFakeDriverArguments } from "../fake-driver-launch"
import {
  COMPUTER_PROVISION_ARCHITECTURE,
  COMPUTER_PROVISION_ARCHIVE,
  COMPUTER_PROVISION_ARGUMENT_SEPARATOR,
  COMPUTER_PROVISION_ASSET_PATH,
  COMPUTER_PROVISION_BINARY,
  COMPUTER_PROVISION_CAPTURE_DIRECTORY,
  COMPUTER_PROVISION_CHECKSUM_SOURCE,
  COMPUTER_PROVISION_COMMAND_PLACEHOLDER,
  COMPUTER_PROVISION_ENCODING,
  COMPUTER_PROVISION_FETCH_FUNCTION,
  COMPUTER_PROVISION_FETCH_OPTIONS,
  COMPUTER_PROVISION_INSTALLATION_DIRECTORY,
  COMPUTER_PROVISION_NONEXECUTABLE_MODE,
  COMPUTER_PROVISION_RELEASE_ID,
  COMPUTER_PROVISION_RELEASE_RESOLVED,
  COMPUTER_PROVISION_SCRIPT_MODE,
  COMPUTER_PROVISION_SCRIPT_TEMPLATE,
  COMPUTER_PROVISION_SOURCE_DIRECTORY,
  COMPUTER_PROVISION_STAGE_MISSING,
  COMPUTER_PROVISION_TAG_PREFIX,
  COMPUTER_PROVISION_TAR_COMMAND,
  COMPUTER_PROVISION_TAR_CREATE_FLAG,
  COMPUTER_PROVISION_TAR_DIRECTORY_FLAG,
  COMPUTER_PROVISION_TEST_ROOT,
} from "./constants"
import { computerQuoteProvisioningArgument } from "./fixture-operations"
import { type ComputerProvisioningDownload } from "./types"

export class ComputerProvisioningFixture {
  readonly directory = resolve(COMPUTER_PROVISION_TEST_ROOT, randomUUID())

  readonly installationDirectory = join(this.directory, COMPUTER_PROVISION_INSTALLATION_DIRECTORY)

  readonly dependencies: ComputerUseDependencies = {
    platform: COMPUTER_LINUX,
    installationDirectory: this.installationDirectory,
    captureDirectory: join(this.directory, COMPUTER_PROVISION_CAPTURE_DIRECTORY),
    environment: process.env,
    wait: new ComputerTestWait(),
  }

  readonly infrastructure = new ComputerSystemInfrastructure(this.dependencies)

  readonly service = new ComputerUseService(this.dependencies, this.infrastructure)

  readonly download = vi.fn<ComputerProvisioningDownload>()

  readonly resolve = vi.fn<typeof driverRelease.computerResolveDriverRelease>()

  private readonly realFetch = globalThis.fetch.bind(globalThis)

  private readonly payload = this.buildArchive()

  private baseUrl = ""

  private server?: ComputerArtifactTestServer

  latestPolicy(): ComputerDriverPolicy {
    return { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE }
  }

  selectionFor(version: string): ComputerDriverReleaseSelection {
    return {
      releaseId: COMPUTER_PROVISION_RELEASE_ID,
      tag: `${COMPUTER_PROVISION_TAG_PREFIX}${version}`,
      version,
      platform: COMPUTER_LINUX,
      architecture: COMPUTER_PROVISION_ARCHITECTURE,
      assetName: COMPUTER_PROVISION_ARCHIVE,
      assetUrl: `${this.baseUrl}/${COMPUTER_PROVISION_ASSET_PATH}`,
      expectedSha256: computerArtifactDigest(this.payload),
      checksumSource: COMPUTER_PROVISION_CHECKSUM_SOURCE,
    }
  }

  selection(): ComputerDriverReleaseSelection {
    return this.selectionFor(COMPUTER_FAKE_VERSION)
  }

  async start(): Promise<void> {
    this.server = new ComputerArtifactTestServer(this.payload, COMPUTER_ARTIFACT_TEST_HTTP_OK)
    this.baseUrl = await this.server.start()
    this.download.mockImplementation(this.downloadArtifact.bind(this))
    this.resolve.mockResolvedValue({
      kind: COMPUTER_PROVISION_RELEASE_RESOLVED,
      selection: this.selection(),
      pages: [],
    })
    vi.spyOn(driverRelease, "computerResolveDriverRelease").mockImplementation(this.resolve)
    vi.stubGlobal(COMPUTER_PROVISION_FETCH_FUNCTION, this.download)
  }

  async stop(): Promise<void> {
    await this.service.stop()
    if (this.server) {
      await this.server.stop()
    }
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    rmSync(this.directory, { recursive: true, force: true })
  }

  private downloadArtifact(url: string): Promise<Response> {
    return this.realFetch(url, COMPUTER_PROVISION_FETCH_OPTIONS)
  }

  installVersion(version: string): string {
    const directory = join(this.installationDirectory, version)
    mkdirSync(directory, { recursive: true })
    const binary = join(directory, COMPUTER_PROVISION_BINARY)
    writeFileSync(binary, COMPUTER_PROVISION_SCRIPT_TEMPLATE, { mode: COMPUTER_PROVISION_SCRIPT_MODE })
    computerWriteCurrentVersion(this.installationDirectory, version)
    return binary
  }

  installFakeDriverAt(version: string, policy: ComputerDriverPolicy): string {
    const selection = this.selectionFor(version)
    const directory = join(this.installationDirectory, version)
    mkdirSync(directory, { recursive: true })
    const binary = join(directory, COMPUTER_PROVISION_BINARY)
    const argumentsValue = [process.execPath, ...computerFakeDriverArguments()]
    const command = argumentsValue.map(computerQuoteProvisioningArgument).join(COMPUTER_PROVISION_ARGUMENT_SEPARATOR)
    writeFileSync(binary, COMPUTER_PROVISION_SCRIPT_TEMPLATE.replace(COMPUTER_PROVISION_COMMAND_PLACEHOLDER, command), {
      mode: COMPUTER_PROVISION_SCRIPT_MODE,
    })
    computerWriteDriverReceipt(directory, {
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
      policy: computerReceiptPolicy(policy),
    })
    return binary
  }

  async emptyExtractedBinary(): Promise<ComputerArchiveExtractionResult> {
    const binary = this.extractedBinary()
    writeFileSync(binary, "", { mode: COMPUTER_PROVISION_SCRIPT_MODE })
    return { kind: COMPUTER_ARCHIVE_EXTRACTED }
  }

  async nonexecutableExtractedBinary(): Promise<ComputerArchiveExtractionResult> {
    const binary = this.extractedBinary()
    writeFileSync(binary, COMPUTER_PROVISION_SCRIPT_TEMPLATE, { encoding: COMPUTER_PROVISION_ENCODING })
    chmodSync(binary, COMPUTER_PROVISION_NONEXECUTABLE_MODE)
    return { kind: COMPUTER_ARCHIVE_EXTRACTED }
  }

  private extractedBinary(): string {
    const entries = readdirSync(this.installationDirectory)
    const [stage] = entries
    if (!stage) {
      throw new Error(COMPUTER_PROVISION_STAGE_MISSING)
    }
    return join(this.installationDirectory, stage, COMPUTER_INSTALL_EXTRACTION_DIRECTORY, COMPUTER_PROVISION_BINARY)
  }

  private buildArchive(): Buffer {
    const source = join(this.directory, COMPUTER_PROVISION_SOURCE_DIRECTORY)
    mkdirSync(source, { recursive: true })
    const argumentsValue = [process.execPath, ...computerFakeDriverArguments()]
    const command = argumentsValue.map(computerQuoteProvisioningArgument).join(COMPUTER_PROVISION_ARGUMENT_SEPARATOR)
    const script = COMPUTER_PROVISION_SCRIPT_TEMPLATE.replace(COMPUTER_PROVISION_COMMAND_PLACEHOLDER, command)
    writeFileSync(join(source, COMPUTER_PROVISION_BINARY), script, {
      mode: COMPUTER_PROVISION_SCRIPT_MODE,
    })
    const archive = join(this.directory, COMPUTER_PROVISION_ARCHIVE)
    execFileSync(COMPUTER_PROVISION_TAR_COMMAND, [
      COMPUTER_PROVISION_TAR_CREATE_FLAG,
      archive,
      COMPUTER_PROVISION_TAR_DIRECTORY_FLAG,
      source,
      COMPUTER_PROVISION_BINARY,
    ])
    return readFileSync(archive)
  }
}
