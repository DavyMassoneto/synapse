import {
  auditIphoneHomeScreen,
  compactIphoneHomePage,
  createIphoneHomeFolder,
  editIphoneHomeScreen,
  exitIphoneHomeEdit,
  extractIphoneHomeApp,
  gotoIphoneHomePage,
  hopIphoneHomeIcon,
  type IphoneHomeScreenPort,
  renameIphoneHomeFolder,
} from "#synapse/modules/iphone/internal/home-screen-operations"
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
  type IphoneHomeOperation,
  type IphoneHomeOutput,
} from "#synapse/modules/iphone/public/contracts"

import { mergeIphoneFolderAcrossPages, readIphoneFolderAtPage, readIphoneHomeAtPage } from "./home-page"

export async function executeIphoneHome(
  port: IphoneHomeScreenPort,
  operation: IphoneHomeOperation,
  signal: AbortSignal,
): Promise<IphoneHomeOutput> {
  switch (operation.kind) {
    case IPHONE_HOME_OP_READ:
      return await readIphoneHomeAtPage(port, operation, signal)
    case IPHONE_HOME_OP_EDIT:
      return await editIphoneHomeScreen(port, signal)
    case IPHONE_HOME_OP_EXIT_EDIT:
      return await exitIphoneHomeEdit(port, signal)
    case IPHONE_HOME_OP_GOTO:
      return await gotoIphoneHomePage(port, operation.page, signal)
    case IPHONE_HOME_OP_FOLDER:
      return await readIphoneFolderAtPage(port, operation, signal)
    case IPHONE_HOME_OP_HOP:
      return await hopIphoneHomeIcon(port, operation, signal)
    case IPHONE_HOME_OP_COMPACT:
      return await compactIphoneHomePage(port, operation.page, signal)
    case IPHONE_HOME_OP_AUDIT:
      return await auditIphoneHomeScreen(port, signal)
    case IPHONE_HOME_OP_MERGE:
      return await mergeIphoneFolderAcrossPages(port, operation, signal)
    case IPHONE_HOME_OP_CREATE:
      return await createIphoneHomeFolder(port, operation.first, operation.second, operation.name, signal)
    case IPHONE_HOME_OP_EXTRACT:
      return await extractIphoneHomeApp(port, operation.folder, operation.app, signal)
    case IPHONE_HOME_OP_RENAME:
      return await renameIphoneHomeFolder(port, operation.name, operation.newName, signal)
  }
}
