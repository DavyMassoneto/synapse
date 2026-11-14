import crypto from "node:crypto"
import { type PathLike } from "node:fs"
import files from "node:fs/promises"
import { syncBuiltinESMExports } from "node:module"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import {
  IPHONE_PROVISION_ACTIVE,
  IPHONE_PROVISION_DIRECTORY,
  provisionIphoneAppium,
} from "#synapse/modules/iphone/adapters/appium-provision"
import { IphoneProvisionExecutorDouble } from "./appium-provision-support"

const originalLink = files.link
let directory = ""
let controller = new AbortController()
let executor = new IphoneProvisionExecutorDouble()

async function prepare(): Promise<void> {
  directory = await files.mkdtemp(join(tmpdir(), "synapse-appium-publish-"))
  controller = new AbortController()
  executor = new IphoneProvisionExecutorDouble()
}

async function dispose(): Promise<void> {
  vi.restoreAllMocks()
  syncBuiltinESMExports()
  await files.rm(directory, { recursive: true, force: true })
}

async function abortAfterAtomicCommit(source: PathLike, destination: PathLike): Promise<void> {
  await originalLink(source, destination)
  controller.abort()
}

async function preservesCommittedWinnerOnCancellation(): Promise<void> {
  vi.spyOn(files, "link").mockImplementation(abortAfterAtomicCommit)
  syncBuiltinESMExports()
  const result = await provisionIphoneAppium(
    { stateDirectory: directory, path: "", host: "darwin" },
    controller.signal,
    executor.execute.bind(executor),
  )
  expect(controller.signal.aborted).toBe(true)
  expect(await files.readFile(result.executable, "utf8")).toBe("fixture")
  expect(await files.readdir(join(directory, IPHONE_PROVISION_DIRECTORY))).toHaveLength(2)
  expect(
    (await files.readFile(join(directory, IPHONE_PROVISION_DIRECTORY, IPHONE_PROVISION_ACTIVE), "utf8")).length,
  ).toBeGreaterThan(0)
}

async function exclusiveUuidCollisionIsNotOwned(): Promise<void> {
  const uuid = "12345678-1234-4123-8123-123456789abc"
  vi.spyOn(crypto, "randomUUID").mockReturnValue(uuid)
  syncBuiltinESMExports()
  const existing = join(directory, IPHONE_PROVISION_DIRECTORY, uuid)
  await files.mkdir(existing, { recursive: true })
  await files.writeFile(join(existing, "owner"), "external")
  await expect(
    provisionIphoneAppium(
      { stateDirectory: directory, path: "", host: "darwin" },
      controller.signal,
      executor.execute.bind(executor),
    ),
  ).rejects.toThrow()
  expect(await files.readFile(join(existing, "owner"), "utf8")).toBe("external")
  expect(executor.commands).toHaveLength(0)
}

async function unsupportedLinkNeverPublishes(): Promise<void> {
  vi.spyOn(files, "link").mockRejectedValue(new Error("ENOTSUP"))
  syncBuiltinESMExports()
  await expect(
    provisionIphoneAppium(
      { stateDirectory: directory, path: "", host: "darwin" },
      controller.signal,
      executor.execute.bind(executor),
    ),
  ).rejects.toThrow("hard links")
  expect(await files.readdir(join(directory, IPHONE_PROVISION_DIRECTORY))).toStrictEqual([])
}

function suite(): void {
  beforeEach(prepare)
  afterEach(dispose)
  test("cancelar depois do commit não remove o vencedor", preservesCommittedWinnerOnCancellation)
  test("colisão UUID não concede propriedade nem remove árvore alheia", exclusiveUuidCollisionIsNotOwned)
  test("filesystem sem hard links falha sem publicar", unsupportedLinkNeverPublishes)
}

describe("publicação atômica do Appium", suite)
