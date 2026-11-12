import {
  IPHONE_HOME_OP_AUDIT,
  IPHONE_HOME_OP_COMPACT,
  IPHONE_HOME_OP_CREATE,
  IPHONE_HOME_OP_EDIT,
  IPHONE_HOME_OP_EXIT_EDIT,
  IPHONE_HOME_OP_EXTRACT,
  IPHONE_HOME_OP_FOLDER,
  IPHONE_HOME_OP_GOTO,
  IPHONE_HOME_OP_HOP,
  IPHONE_HOME_OP_MERGE,
  IPHONE_HOME_OP_READ,
  IPHONE_HOME_OP_RENAME,
  type IphoneHomeFolderOperation,
  type IphoneHomeMergeOperation,
  type IphoneHomeOperation,
  type IphoneHomeReadOperation,
} from "#synapse/modules"
import { PI_IPHONE_INVALID_ARGUMENTS } from "./constants"
import { iphoneRequiredText } from "./input-values"
import { type PiIphoneInput } from "./types"

export function translateIphoneHome(input: PiIphoneInput): IphoneHomeOperation {
  switch (input.op) {
    case IPHONE_HOME_OP_READ:
      return iphoneHomeRead(input)
    case IPHONE_HOME_OP_EDIT:
    case IPHONE_HOME_OP_EXIT_EDIT:
    case IPHONE_HOME_OP_AUDIT:
      return { kind: input.op }
    case IPHONE_HOME_OP_GOTO:
    case IPHONE_HOME_OP_COMPACT:
      return { kind: input.op, page: iphoneRequiredPage(input.page) }
    case IPHONE_HOME_OP_FOLDER:
      return iphoneHomeFolder(input)
    default:
      return translateIphoneHomeMutation(input)
  }
}

function translateIphoneHomeMutation(input: PiIphoneInput): IphoneHomeOperation {
  switch (input.op) {
    case IPHONE_HOME_OP_HOP:
      return {
        kind: input.op,
        name: iphoneRequiredText(input.name),
        folder: input.folder === true,
        from: iphoneRequiredPage(input.from_page),
        to: iphoneRequiredPage(input.to_page),
      }
    case IPHONE_HOME_OP_MERGE:
      return iphoneHomeMerge(input)
    case IPHONE_HOME_OP_CREATE:
      return {
        kind: input.op,
        first: iphoneRequiredText(input.name),
        second: iphoneRequiredText(input.name2),
        name: iphoneRequiredText(input.new_name),
      }
    case IPHONE_HOME_OP_EXTRACT:
      return { kind: input.op, folder: iphoneRequiredText(input.name), app: iphoneRequiredText(input.app) }
    case IPHONE_HOME_OP_RENAME:
      return { kind: input.op, name: iphoneRequiredText(input.name), newName: iphoneRequiredText(input.new_name) }
    default:
      throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
}

function iphoneHomeRead(input: PiIphoneInput): IphoneHomeReadOperation {
  const operation: IphoneHomeReadOperation = { kind: IPHONE_HOME_OP_READ }
  if (typeof input.page === "number") {
    operation.page = input.page
  }
  return operation
}

function iphoneHomeFolder(input: PiIphoneInput): IphoneHomeFolderOperation {
  const operation: IphoneHomeFolderOperation = { kind: IPHONE_HOME_OP_FOLDER, name: iphoneRequiredText(input.name) }
  if (typeof input.page === "number") {
    operation.page = input.page
  }
  return operation
}

function iphoneHomeMerge(input: PiIphoneInput): IphoneHomeMergeOperation {
  const operation: IphoneHomeMergeOperation = {
    kind: IPHONE_HOME_OP_MERGE,
    source: iphoneRequiredText(input.name),
    destination: iphoneRequiredText(input.into),
  }
  if (typeof input.page === "number") {
    operation.page = input.page
  }
  if (typeof input.from_page === "number") {
    operation.fromPage = input.from_page
  }
  if (typeof input.to_page === "number") {
    operation.toPage = input.to_page
  }
  return operation
}

function iphoneRequiredPage(page?: number): number {
  if (typeof page !== "number") {
    throw new Error(PI_IPHONE_INVALID_ARGUMENTS)
  }
  return page
}
