import {
  exitIphoneHomeEdit,
  gotoIphoneHomePage,
  hasIphoneSameFolderContents,
  hopIphoneHomeIcon,
  IPHONE_HOME_DIRECT_DROP_PENDING,
  type IphoneHomeCascadeSnapshot,
  type IphoneHomeScreenPort,
  mergeIphoneHomeFolder,
  readIphoneHomeFolder,
  readIphoneHomeScreen,
  verifyIphoneCascade,
} from "#synapse/modules/iphone/internal/home-screen-operations"
import {
  IPHONE_ACCEPTED,
  IPHONE_REFUSED,
  type IphoneHomeFolderOperation,
  type IphoneHomeMergeOperation,
  type IphoneHomeOutput,
  type IphoneHomeReadOperation,
} from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_MODULE_DIRECT_DROP,
  IPHONE_MODULE_DIRECT_DROP_FAILURE,
  IPHONE_MODULE_HOPS_DONE,
  IPHONE_MODULE_PAGE_REQUIRED,
} from "./constants"

import { type IphoneAcrossPagesRequest, type IphoneAcrossPagesResult } from "./types"

export async function readIphoneHomeAtPage(
  port: IphoneHomeScreenPort,
  operation: IphoneHomeReadOperation,
  signal: AbortSignal,
): Promise<IphoneHomeOutput> {
  if (operation.page) {
    const result = await gotoIphoneHomePage(port, operation.page, signal)
    if (result.kind === IPHONE_REFUSED) {
      return result
    }
  }
  return readIphoneHomeScreen(port, signal)
}

export async function readIphoneFolderAtPage(
  port: IphoneHomeScreenPort,
  operation: IphoneHomeFolderOperation,
  signal: AbortSignal,
): Promise<IphoneHomeOutput> {
  if (operation.page) {
    const result = await gotoIphoneHomePage(port, operation.page, signal)
    if (result.kind === IPHONE_REFUSED) {
      return result
    }
  }
  return readIphoneHomeFolder(port, operation.name, signal)
}

export async function verifyIphoneDirectFolderDrop(
  port: IphoneHomeScreenPort,
  operation: IphoneAcrossPagesRequest,
  before: string[],
  signal: AbortSignal,
): Promise<IphoneAcrossPagesResult> {
  const go = await gotoIphoneHomePage(port, operation.toPage, signal)
  if (go.kind === IPHONE_REFUSED) {
    return go
  }
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  if (state.layout.icons.some((icon) => !icon.folder && icon.name === operation.source)) {
    return { kind: IPHONE_REFUSED, message: IPHONE_MODULE_DIRECT_DROP_FAILURE }
  }
  const exit = await exitIphoneHomeEdit(port, signal)
  if (exit.kind === IPHONE_REFUSED) {
    return exit
  }
  const folder = await readIphoneHomeFolder(port, operation.destination, signal)
  if (folder.kind === IPHONE_REFUSED) {
    return folder
  }
  if (!hasIphoneSameFolderContents(folder.names, [...before, operation.source])) {
    return { kind: IPHONE_REFUSED, message: IPHONE_MODULE_DIRECT_DROP_FAILURE }
  }
  return { kind: IPHONE_MODULE_DIRECT_DROP }
}

async function confirmIphonePendingDrop(
  port: IphoneHomeScreenPort,
  operation: IphoneAcrossPagesRequest,
  before: string[],
  cascade: IphoneHomeCascadeSnapshot,
  signal: AbortSignal,
): Promise<IphoneAcrossPagesResult> {
  const verified = await verifyIphoneDirectFolderDrop(port, operation, before, signal)
  if (verified.kind === IPHONE_REFUSED) {
    return verified
  }
  const result = await verifyIphoneCascade(port, cascade, operation.toPage, signal)
  if (result.kind === IPHONE_REFUSED) {
    return result
  }
  return verified
}

async function hopIphoneHomeAcrossPages(
  port: IphoneHomeScreenPort,
  operation: IphoneAcrossPagesRequest,
  signal: AbortSignal,
  before: string[],
): Promise<IphoneAcrossPagesResult> {
  let page = operation.fromPage
  while (page !== operation.toPage) {
    const next = page + (operation.toPage > page ? 1 : -1)
    const hop = await hopIphoneHomeIcon(port, { name: operation.source, folder: false, from: page, to: next }, signal)
    if (hop.kind === IPHONE_REFUSED) {
      return hop
    }
    if (hop.kind === IPHONE_HOME_DIRECT_DROP_PENDING) {
      if (next !== operation.toPage) {
        return { kind: IPHONE_REFUSED, message: IPHONE_MODULE_DIRECT_DROP_FAILURE }
      }
      return confirmIphonePendingDrop(port, operation, before, hop.cascade, signal)
    }
    page = next
  }
  return { kind: IPHONE_MODULE_HOPS_DONE }
}

export async function mergeIphoneFolderAcrossPages(
  port: IphoneHomeScreenPort,
  operation: IphoneHomeMergeOperation,
  signal: AbortSignal,
): Promise<IphoneHomeOutput> {
  if (operation.fromPage && operation.toPage) {
    return mergeIphoneAcrossPages(
      port,
      {
        source: operation.source,
        destination: operation.destination,
        fromPage: operation.fromPage,
        toPage: operation.toPage,
      },
      signal,
    )
  }
  if (operation.fromPage || operation.toPage) {
    return { kind: IPHONE_REFUSED, message: IPHONE_MODULE_PAGE_REQUIRED }
  }
  if (operation.page) {
    const go = await gotoIphoneHomePage(port, operation.page, signal)
    if (go.kind === IPHONE_REFUSED) {
      return go
    }
  }
  return mergeIphoneHomeFolder(port, operation.source, operation.destination, signal)
}

async function mergeIphoneAcrossPages(
  port: IphoneHomeScreenPort,
  operation: IphoneAcrossPagesRequest,
  signal: AbortSignal,
): Promise<IphoneHomeOutput> {
  const goDestination = await gotoIphoneHomePage(port, operation.toPage, signal)
  if (goDestination.kind === IPHONE_REFUSED) {
    return goDestination
  }
  const exit = await exitIphoneHomeEdit(port, signal)
  if (exit.kind === IPHONE_REFUSED) {
    return exit
  }
  const before = await readIphoneHomeFolder(port, operation.destination, signal)
  if (before.kind === IPHONE_REFUSED) {
    return before
  }
  const hops = await hopIphoneHomeAcrossPages(port, operation, signal, before.names)
  if (hops.kind === IPHONE_REFUSED) {
    return hops
  }
  if (hops.kind === IPHONE_MODULE_DIRECT_DROP) {
    return { kind: IPHONE_ACCEPTED }
  }
  const go = await gotoIphoneHomePage(port, operation.toPage, signal)
  if (go.kind === IPHONE_REFUSED) {
    return go
  }
  return mergeIphoneHomeFolder(port, operation.source, operation.destination, signal)
}
