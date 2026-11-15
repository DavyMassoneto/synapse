import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { Value } from "typebox/value"
import { COMPUTER_ERROR_CODE_MISSING_FILE, isErrorWithCode } from "../command-execution"
import {
  COMPUTER_DRIVER_ENCODING,
  COMPUTER_DRIVER_RECEIPT_ABSENT,
  COMPUTER_DRIVER_RECEIPT_FILE,
  COMPUTER_DRIVER_RECEIPT_FILE_MODE,
  COMPUTER_DRIVER_RECEIPT_FOUND,
  COMPUTER_DRIVER_RECEIPT_HASH_ALGORITHM,
  COMPUTER_DRIVER_RECEIPT_HASH_ENCODING,
  COMPUTER_DRIVER_RECEIPT_INVALID,
  COMPUTER_DRIVER_RECEIPT_INVALID_MESSAGE,
} from "./constants"
import { COMPUTER_DRIVER_RECEIPT_SCHEMA } from "./schemas"
import { type ComputerDriverReceipt, type ComputerDriverReceiptResult } from "./types"

export function computerDriverReceiptPath(directory: string): string {
  return join(directory, COMPUTER_DRIVER_RECEIPT_FILE)
}

export function computerExecutableDigest(binary: string): string {
  return createHash(COMPUTER_DRIVER_RECEIPT_HASH_ALGORITHM)
    .update(readFileSync(binary))
    .digest(COMPUTER_DRIVER_RECEIPT_HASH_ENCODING)
}

export function computerWriteDriverReceipt(directory: string, receipt: ComputerDriverReceipt): void {
  writeFileSync(computerDriverReceiptPath(directory), JSON.stringify(receipt), {
    mode: COMPUTER_DRIVER_RECEIPT_FILE_MODE,
  })
}

export function computerReadDriverReceipt(directory: string): ComputerDriverReceiptResult {
  let text: string
  try {
    text = readFileSync(computerDriverReceiptPath(directory), COMPUTER_DRIVER_ENCODING)
  } catch (error) {
    if (error instanceof Error && isErrorWithCode(error, COMPUTER_ERROR_CODE_MISSING_FILE)) {
      return { kind: COMPUTER_DRIVER_RECEIPT_ABSENT }
    }
    throw error
  }
  return computerParseDriverReceipt(text)
}

function computerParseDriverReceipt(text: string): ComputerDriverReceiptResult {
  try {
    const receipt: ComputerDriverReceipt = Value.Parse(COMPUTER_DRIVER_RECEIPT_SCHEMA, JSON.parse(text))
    return { kind: COMPUTER_DRIVER_RECEIPT_FOUND, receipt }
  } catch {
    return { kind: COMPUTER_DRIVER_RECEIPT_INVALID, message: COMPUTER_DRIVER_RECEIPT_INVALID_MESSAGE }
  }
}
