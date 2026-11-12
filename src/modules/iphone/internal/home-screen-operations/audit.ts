import { IPHONE_HOME_PAGE_KNOWN } from "#synapse/modules/iphone/internal/home-screen-layout"
import { IPHONE_ACCEPTED, IPHONE_REFUSED } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_HOME_PAGE_FAILURE } from "./constants"
import { readIphoneHomeFolder } from "./folder"
import { gotoIphoneHomePage } from "./goto"
import { readIphoneHomeScreen } from "./read"
import {
  type IphoneHomeAuditFolder,
  type IphoneHomeAuditPage,
  type IphoneHomeAuditPageResult,
  type IphoneHomeAuditResult,
  type IphoneHomeScreenPort,
} from "./types"

export async function auditIphoneHomeScreen(
  port: IphoneHomeScreenPort,
  signal: AbortSignal,
): Promise<IphoneHomeAuditResult> {
  const first = await gotoIphoneHomePage(port, 1, signal)
  if (first.kind === IPHONE_REFUSED) {
    return first
  }
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  if (state.page.kind !== IPHONE_HOME_PAGE_KNOWN || state.edit || state.inFolder || state.alert) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_PAGE_FAILURE }
  }
  const pages: IphoneHomeAuditPage[] = []
  for (let page = 1; page <= state.page.total; page++) {
    const result = await auditIphoneHomePage(port, page, signal)
    if (result.kind === IPHONE_REFUSED) {
      return result
    }
    pages.push(result.page)
  }
  return { kind: IPHONE_ACCEPTED, pages }
}

async function auditIphoneHomePage(
  port: IphoneHomeScreenPort,
  page: number,
  signal: AbortSignal,
): Promise<IphoneHomeAuditPageResult> {
  const navigation = await gotoIphoneHomePage(port, page, signal)
  if (navigation.kind === IPHONE_REFUSED) {
    return navigation
  }
  const state = await readIphoneHomeScreen(port, signal)
  if (state.kind === IPHONE_REFUSED) {
    return state
  }
  if (
    state.alert ||
    state.edit ||
    state.inFolder ||
    state.page.kind !== IPHONE_HOME_PAGE_KNOWN ||
    state.page.current !== page
  ) {
    return { kind: IPHONE_REFUSED, message: IPHONE_HOME_PAGE_FAILURE }
  }
  const folders: IphoneHomeAuditFolder[] = []
  const apps: string[] = []
  for (const icon of state.layout.icons) {
    if (icon.folder) {
      const folder = await readIphoneHomeFolder(port, icon.name, signal)
      if (folder.kind === IPHONE_REFUSED) {
        return folder
      }
      folders.push({ name: icon.name, apps: folder.names })
    } else {
      apps.push(icon.name)
    }
  }
  return {
    kind: IPHONE_ACCEPTED,
    page: {
      page,
      apps,
      folders,
      widgets: state.layout.widgetSlots.length > 0,
    },
  }
}
