import { type IPHONE_ACCEPTED } from "../constants"
import { type IphonePoint } from "../geometry"
import { type IphoneAccepted, type IphoneRefused } from "../result"
import {
  type IPHONE_HOME_OP_AUDIT,
  type IPHONE_HOME_OP_COMPACT,
  type IPHONE_HOME_OP_CREATE,
  type IPHONE_HOME_OP_EDIT,
  type IPHONE_HOME_OP_EXIT_EDIT,
  type IPHONE_HOME_OP_EXTRACT,
  type IPHONE_HOME_OP_FOLDER,
  type IPHONE_HOME_OP_GOTO,
  type IPHONE_HOME_OP_HOP,
  type IPHONE_HOME_OP_MERGE,
  type IPHONE_HOME_OP_READ,
  type IPHONE_HOME_OP_RENAME,
  type IPHONE_HOME_PAGE_KNOWN,
  type IPHONE_HOME_PAGE_MISSING,
} from "./constants"

export type IphoneHomePageKind = typeof IPHONE_HOME_OP_GOTO | typeof IPHONE_HOME_OP_COMPACT

export type IphoneHomeSimpleKind =
  | typeof IPHONE_HOME_OP_EDIT
  | typeof IPHONE_HOME_OP_EXIT_EDIT
  | typeof IPHONE_HOME_OP_AUDIT

export type IphoneHomeOperation =
  | IphoneHomeReadOperation
  | IphoneHomePageOperation
  | IphoneHomeFolderOperation
  | IphoneHomeHopOperation
  | IphoneHomeSimpleOperation
  | IphoneHomeMergeOperation
  | IphoneHomeCreateOperation
  | IphoneHomeExtractOperation
  | IphoneHomeRenameOperation

export interface IphoneHomeReadOperation {
  kind: typeof IPHONE_HOME_OP_READ
  page?: number
}

export interface IphoneHomePageOperation {
  kind: IphoneHomePageKind
  page: number
}

export interface IphoneHomeFolderOperation {
  kind: typeof IPHONE_HOME_OP_FOLDER
  name: string
  page?: number
}

export interface IphoneHomeHopOperation {
  kind: typeof IPHONE_HOME_OP_HOP
  name: string
  folder: boolean
  from: number
  to: number
}

export interface IphoneHomeSimpleOperation {
  kind: IphoneHomeSimpleKind
}

export interface IphoneHomeMergeOperation {
  kind: typeof IPHONE_HOME_OP_MERGE
  source: string
  destination: string
  page?: number
  fromPage?: number
  toPage?: number
}

export interface IphoneHomeCreateOperation {
  kind: typeof IPHONE_HOME_OP_CREATE
  first: string
  second: string
  name: string
}

export interface IphoneHomeExtractOperation {
  kind: typeof IPHONE_HOME_OP_EXTRACT
  folder: string
  app: string
}

export interface IphoneHomeRenameOperation {
  kind: typeof IPHONE_HOME_OP_RENAME
  name: string
  newName: string
}

export type IphoneHomeOutput =
  | IphoneHomeStateAccepted
  | IphoneHomeAuditAccepted
  | IphoneHomeFolderRead
  | IphoneAccepted
  | IphoneRefused

export interface IphoneHomeIcon {
  name: string
  folder: boolean
  badge: string
  point: IphonePoint
  column: number
  row: number
  slot: number
}

export interface IphoneHomeLayout {
  icons: IphoneHomeIcon[]
  widgetSlots: number[]
  vacantSlots: number[]
}

export interface IphoneHomeLayoutAccepted {
  kind: typeof IPHONE_ACCEPTED
  layout: IphoneHomeLayout
}

export type IphoneHomeLayoutResult = IphoneHomeLayoutAccepted | IphoneRefused

export interface IphoneHomeFolderCountKnown {
  kind: typeof IPHONE_HOME_PAGE_KNOWN
  count: number
}

export type IphoneHomeFolderCount = IphoneHomeFolderCountKnown | IphoneHomePageMissing

export interface IphoneHomePageKnown {
  kind: typeof IPHONE_HOME_PAGE_KNOWN
  current: number
  total: number
}

export interface IphoneHomePageMissing {
  kind: typeof IPHONE_HOME_PAGE_MISSING
}

export type IphoneHomePage = IphoneHomePageKnown | IphoneHomePageMissing

export interface IphoneHomeStateAccepted {
  kind: typeof IPHONE_ACCEPTED
  layout: IphoneHomeLayout
  page: IphoneHomePage
  edit: boolean
  alert: boolean
  inFolder: boolean
  clearText: boolean
}

export type IphoneHomeStateResult = IphoneHomeStateAccepted | IphoneRefused

export interface IphoneHomeAuditFolder {
  name: string
  apps: string[]
}

export interface IphoneHomeAuditPage {
  page: number
  apps: string[]
  folders: IphoneHomeAuditFolder[]
  widgets: boolean
}

export interface IphoneHomeAuditPageAccepted {
  kind: typeof IPHONE_ACCEPTED
  page: IphoneHomeAuditPage
}

export type IphoneHomeAuditPageResult = IphoneHomeAuditPageAccepted | IphoneRefused

export interface IphoneHomeAuditAccepted {
  kind: typeof IPHONE_ACCEPTED
  pages: IphoneHomeAuditPage[]
}

export type IphoneHomeAuditResult = IphoneHomeAuditAccepted | IphoneRefused

export interface IphoneHomeFolderRead {
  kind: typeof IPHONE_ACCEPTED
  names: string[]
}

export type IphoneHomeFolderResult = IphoneHomeFolderRead | IphoneRefused
