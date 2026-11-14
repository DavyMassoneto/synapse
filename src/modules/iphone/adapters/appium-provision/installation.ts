import { randomUUID } from "node:crypto"
import { link, mkdir, realpath, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { installIphoneAppiumDependencies, probeIphoneAppiumInstallation } from "./commands"
import {
  IPHONE_PROVISION_ACTIVE,
  IPHONE_PROVISION_ACTIVE_MISSING,
  IPHONE_PROVISION_ACTIVE_READY,
  IPHONE_PROVISION_APPIUM_ENTRY,
  IPHONE_PROVISION_APPIUM_PACKAGE,
  IPHONE_PROVISION_DIRECTORY,
  IPHONE_PROVISION_DIRECTORY_MODE,
  IPHONE_PROVISION_EMPTY_NPMRC,
  IPHONE_PROVISION_EMPTY_PACKAGE,
  IPHONE_PROVISION_EXISTS_CODE,
  IPHONE_PROVISION_FILE_MODE,
  IPHONE_PROVISION_GLOBAL_NPMRC,
  IPHONE_PROVISION_HOME,
  IPHONE_PROVISION_LINK_UNSUPPORTED,
  IPHONE_PROVISION_MISSING_CODE,
  IPHONE_PROVISION_NODE_MODULES,
  IPHONE_PROVISION_NPMRC,
  IPHONE_PROVISION_PACKAGE_JSON,
  IPHONE_PROVISION_READY,
} from "./constants"
import { IphoneProvisionInterrupted } from "./failure"
import {
  checkIphoneProvisionDirectory,
  readIphoneProvisionFile,
  snapshotIphoneProvisionFiles,
  verifyIphoneProvisionReceipt,
} from "./files"
import {
  type IphoneAppiumInstallation,
  type IphoneAppiumProvisionExecutor,
  type IphoneAppiumProvisionLayout,
  type IphoneAppiumProvisionRequest,
  type IphoneProvisionActive,
} from "./types"
import { checkIphoneProvisionNode, validateIphoneProvisionPackages } from "./validation"

export async function iphoneProvisionLayout(
  stateDirectory: string,
  installation: string,
): Promise<IphoneAppiumProvisionLayout> {
  await mkdir(stateDirectory, { recursive: true })
  const state = await realpath(stateDirectory)
  const root = join(state, IPHONE_PROVISION_DIRECTORY)
  await mkdir(root, { recursive: true, mode: IPHONE_PROVISION_DIRECTORY_MODE })
  await checkIphoneProvisionDirectory(root)
  const directory = join(root, installation)
  const home = join(directory, IPHONE_PROVISION_HOME)
  return {
    root,
    active: join(root, IPHONE_PROVISION_ACTIVE),
    installation: directory,
    home,
    executable: join(
      home,
      IPHONE_PROVISION_NODE_MODULES,
      IPHONE_PROVISION_APPIUM_PACKAGE,
      IPHONE_PROVISION_APPIUM_ENTRY,
    ),
    configuration: join(directory, IPHONE_PROVISION_NPMRC),
    globalConfiguration: join(directory, IPHONE_PROVISION_GLOBAL_NPMRC),
  }
}

export async function readIphoneActiveInstallation(
  layout: IphoneAppiumProvisionLayout,
): Promise<IphoneProvisionActive> {
  let active: Buffer
  try {
    active = await readIphoneProvisionFile(layout.root, IPHONE_PROVISION_ACTIVE)
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === IPHONE_PROVISION_MISSING_CODE) {
      return { kind: IPHONE_PROVISION_ACTIVE_MISSING }
    }
    throw error
  }
  return { kind: IPHONE_PROVISION_ACTIVE_READY, receipt: await verifyIphoneProvisionReceipt(layout.root, active) }
}

export async function installIphoneManagedAppium(
  request: IphoneAppiumProvisionRequest,
  execute: IphoneAppiumProvisionExecutor,
  signal: AbortSignal,
): Promise<IphoneAppiumInstallation> {
  checkIphoneProvisionNode(process.versions.node)
  const installation = randomUUID()
  const layout = await iphoneProvisionLayout(request.stateDirectory, installation)
  let winner = await readIphoneActiveInstallation(layout)
  if (winner.kind === IPHONE_PROVISION_ACTIVE_MISSING) {
    await createIphoneProvisionInstallation(layout, installation, request, execute, signal)
    winner = await readIphoneActiveInstallation(layout)
  }
  if (winner.kind !== IPHONE_PROVISION_ACTIVE_READY) {
    throw new Error(IPHONE_PROVISION_LINK_UNSUPPORTED)
  }
  const home = join(layout.root, winner.receipt.installation, IPHONE_PROVISION_HOME)
  return {
    executable: join(
      home,
      IPHONE_PROVISION_NODE_MODULES,
      IPHONE_PROVISION_APPIUM_PACKAGE,
      IPHONE_PROVISION_APPIUM_ENTRY,
    ),
    appiumHome: home,
  }
}

async function prepareIphoneProvisionHome(layout: IphoneAppiumProvisionLayout): Promise<void> {
  await mkdir(layout.home, { mode: IPHONE_PROVISION_DIRECTORY_MODE })
  await writeFile(join(layout.home, IPHONE_PROVISION_PACKAGE_JSON), IPHONE_PROVISION_EMPTY_PACKAGE, {
    flag: "wx",
    mode: IPHONE_PROVISION_FILE_MODE,
  })
  await writeFile(layout.configuration, IPHONE_PROVISION_EMPTY_NPMRC, { flag: "wx", mode: IPHONE_PROVISION_FILE_MODE })
  await writeFile(layout.globalConfiguration, IPHONE_PROVISION_EMPTY_NPMRC, {
    flag: "wx",
    mode: IPHONE_PROVISION_FILE_MODE,
  })
}

async function createIphoneProvisionInstallation(
  layout: IphoneAppiumProvisionLayout,
  installation: string,
  request: IphoneAppiumProvisionRequest,
  execute: IphoneAppiumProvisionExecutor,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted()
  await mkdir(layout.installation, { mode: IPHONE_PROVISION_DIRECTORY_MODE })
  let published = false
  let interrupted = false
  try {
    await prepareIphoneProvisionHome(layout)
    await installIphoneAppiumDependencies(layout, request.path, request.host, execute, signal)
    const registry = await probeIphoneAppiumInstallation(layout, request.path, execute, signal)
    await validateIphoneProvisionPackages(layout, registry)
    published = await publishIphoneProvisionInstallation(layout, installation, signal)
  } catch (error) {
    interrupted = error instanceof IphoneProvisionInterrupted
    throw error
  } finally {
    if (!published && !interrupted) {
      await rm(layout.installation, { recursive: true, force: true })
    }
  }
}

async function publishIphoneProvisionInstallation(
  layout: IphoneAppiumProvisionLayout,
  installation: string,
  signal: AbortSignal,
): Promise<boolean> {
  const receipt = await snapshotIphoneProvisionFiles(layout.home, installation)
  signal.throwIfAborted()
  const ready = join(layout.installation, IPHONE_PROVISION_READY)
  await writeFile(ready, JSON.stringify(receipt), { flag: "wx", mode: IPHONE_PROVISION_FILE_MODE })
  signal.throwIfAborted()
  try {
    await link(ready, layout.active)
    return true
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === IPHONE_PROVISION_EXISTS_CODE) {
      return false
    }
    throw new Error(IPHONE_PROVISION_LINK_UNSUPPORTED, { cause: error })
  }
}
