import { createHash } from "node:crypto"
import { lstat, open, realpath } from "node:fs/promises"
import { dirname, join, relative, resolve, sep } from "node:path"
import { Value } from "typebox/value"
import {
  IPHONE_PROVISION_FILE_BYTES,
  IPHONE_PROVISION_HASH_ALGORITHM,
  IPHONE_PROVISION_HASH_ENCODING,
  IPHONE_PROVISION_HOME,
  IPHONE_PROVISION_INVALID_INSTALLATION,
  IPHONE_PROVISION_INVALID_PATH,
  IPHONE_PROVISION_RECEIPT_FILES,
} from "./constants"
import { IPHONE_PROVISION_RECEIPT_SCHEMA } from "./schemas"
import { type IphoneProvisionReceipt, type IphoneProvisionReceiptFile } from "./types"

export async function checkIphoneProvisionDirectory(path: string): Promise<void> {
  const details = await lstat(path)
  if (!details.isDirectory() || details.isSymbolicLink()) {
    throw new Error(IPHONE_PROVISION_INVALID_PATH)
  }
}

export async function readIphoneProvisionFile(root: string, name: string): Promise<Buffer> {
  const path = resolve(root, name)
  const local = relative(root, path)
  if (local.startsWith(`..${sep}`) || local === ".." || resolve(root) === path) {
    throw new Error(IPHONE_PROVISION_INVALID_PATH)
  }
  await checkIphoneProvisionAncestors(root, dirname(path))
  const details = await lstat(path)
  if (!details.isFile() || details.isSymbolicLink() || details.size > IPHONE_PROVISION_FILE_BYTES) {
    throw new Error(IPHONE_PROVISION_INVALID_INSTALLATION)
  }
  const handle = await open(path, "r")
  try {
    let buffer = Buffer.alloc(details.size + 1)
    let length = 0
    let reading = true
    while (reading && length <= IPHONE_PROVISION_FILE_BYTES) {
      if (length === buffer.length) {
        const capacity = Math.min(buffer.length * 2, IPHONE_PROVISION_FILE_BYTES + 1)
        const expanded = Buffer.alloc(capacity)
        buffer.copy(expanded)
        buffer = expanded
      }
      const output = await handle.read(buffer, length, buffer.length - length, length)
      length += output.bytesRead
      reading = output.bytesRead > 0
    }
    if (length > IPHONE_PROVISION_FILE_BYTES) {
      throw new Error(IPHONE_PROVISION_INVALID_INSTALLATION)
    }
    return buffer.subarray(0, length)
  } finally {
    await handle.close()
  }
}

async function checkIphoneProvisionAncestors(root: string, directory: string): Promise<void> {
  let current = directory
  while (current !== root) {
    await checkIphoneProvisionDirectory(current)
    current = dirname(current)
  }
  await checkIphoneProvisionDirectory(root)
  if ((await realpath(directory)) !== directory) {
    throw new Error(IPHONE_PROVISION_INVALID_PATH)
  }
}

export async function snapshotIphoneProvisionFiles(
  home: string,
  installation: string,
): Promise<IphoneProvisionReceipt> {
  const files: IphoneProvisionReceiptFile[] = []
  for (const path of IPHONE_PROVISION_RECEIPT_FILES) {
    const content = await readIphoneProvisionFile(home, path)
    const digest = createHash(IPHONE_PROVISION_HASH_ALGORITHM).update(content).digest(IPHONE_PROVISION_HASH_ENCODING)
    files.push({ path, digest })
  }
  return { installation, files }
}

export async function verifyIphoneProvisionReceipt(root: string, content: Buffer): Promise<IphoneProvisionReceipt> {
  const receipt = Value.Parse(IPHONE_PROVISION_RECEIPT_SCHEMA, JSON.parse(content.toString()))
  const home = join(root, receipt.installation, IPHONE_PROVISION_HOME)
  const expected = await snapshotIphoneProvisionFiles(home, receipt.installation)
  if (receipt.files.length !== expected.files.length) {
    throw new Error(IPHONE_PROVISION_INVALID_INSTALLATION)
  }
  for (const [index, file] of expected.files.entries()) {
    const stored = receipt.files[index]
    if (!stored || stored.path !== file.path || stored.digest !== file.digest) {
      throw new Error(IPHONE_PROVISION_INVALID_INSTALLATION)
    }
  }
  return receipt
}
