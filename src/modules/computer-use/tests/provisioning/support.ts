import { execFileSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { chmodSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { vi } from "vitest"
import {
  COMPUTER_ARCHIVE_EXTRACTED,
  type ComputerArchiveExtractionResult,
} from "#synapse/modules/computer-use/adapters/archive-extraction"
import * as artifacts from "#synapse/modules/computer-use/adapters/artifact-download"
import { COMPUTER_INSTALL_EXTRACTION_DIRECTORY } from "#synapse/modules/computer-use/adapters/driver-installation"
import { ComputerSystemInfrastructure } from "#synapse/modules/computer-use/adapters/system-infrastructure"
import { ComputerUseService } from "#synapse/modules/computer-use/internal/computer-session"
import { COMPUTER_LINUX, type ComputerUseDependencies } from "#synapse/modules/computer-use/public/contracts"
import { computerArtifactDigest } from "../artifact-download-digest"
import { ComputerArtifactTestServer } from "../artifact-download-support"
import { ComputerTestWait } from "../doubles"
import { computerFakeDriverArguments } from "../fake-driver-launch"
import {
  COMPUTER_PROVISION_ARCHIVE,
  COMPUTER_PROVISION_ARGUMENT_SEPARATOR,
  COMPUTER_PROVISION_ARTIFACT_FOUND,
  COMPUTER_PROVISION_BINARY,
  COMPUTER_PROVISION_CAPTURE_DIRECTORY,
  COMPUTER_PROVISION_COMMAND_PLACEHOLDER,
  COMPUTER_PROVISION_ENCODING,
  COMPUTER_PROVISION_FETCH_FUNCTION,
  COMPUTER_PROVISION_FETCH_OPTIONS,
  COMPUTER_PROVISION_INSTALLATION_DIRECTORY,
  COMPUTER_PROVISION_LOOKUP_FUNCTION,
  COMPUTER_PROVISION_NONEXECUTABLE_MODE,
  COMPUTER_PROVISION_SCRIPT_MODE,
  COMPUTER_PROVISION_SCRIPT_TEMPLATE,
  COMPUTER_PROVISION_SOURCE_DIRECTORY,
  COMPUTER_PROVISION_STAGE_MISSING,
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

  private server?: ComputerArtifactTestServer

  readonly download = vi.fn<ComputerProvisioningDownload>()

  async start(): Promise<void> {
    const payload = this.archive()
    const artifact = { fileName: COMPUTER_PROVISION_ARCHIVE, sha256: computerArtifactDigest(payload) }
    this.server = new ComputerArtifactTestServer(payload)
    const baseUrl = await this.server.start()
    this.download.mockImplementation(globalThis.fetch.bind(globalThis, baseUrl, COMPUTER_PROVISION_FETCH_OPTIONS))
    vi.spyOn(artifacts, COMPUTER_PROVISION_LOOKUP_FUNCTION).mockReturnValue({
      kind: COMPUTER_PROVISION_ARTIFACT_FOUND,
      artifact,
    })
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

  private archive(): Buffer {
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
}
