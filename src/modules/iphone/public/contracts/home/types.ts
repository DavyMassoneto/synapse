import { type IphonePoint } from "../geometry"
import { type IphoneAccepted, type IphoneRefused } from "../result"

export type IphoneHomePageKind = "goto" | "compact"

export type IphoneHomeSimpleKind = "edit" | "exit_edit" | "audit"

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
  kind: "read"
  page?: number
}

export interface IphoneHomePageOperation {
  kind: IphoneHomePageKind
  page: number
}

export interface IphoneHomeFolderOperation {
  kind: "folder"
  name: string
  page?: number
}

export interface IphoneHomeHopOperation {
  kind: "hop"
  name: string
  folder: boolean
  from: number
  to: number
}

export interface IphoneHomeSimpleOperation {
  kind: IphoneHomeSimpleKind
}

export interface IphoneHomeMergeOperation {
  kind: "merge"
  source: string
  destination: string
  page?: number
  fromPage?: number
  toPage?: number
}

export interface IphoneHomeCreateOperation {
  kind: "create"
  first: string
  second: string
  name: string
}

export interface IphoneHomeExtractOperation {
  kind: "extract"
  folder: string
  app: string
}

export interface IphoneHomeRenameOperation {
  kind: "rename"
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
  kind: "accepted"
  layout: IphoneHomeLayout
}

export type IphoneHomeLayoutResult = IphoneHomeLayoutAccepted | IphoneRefused

export interface IphoneHomeFolderCountKnown {
  kind: "known"
  count: number
}

export type IphoneHomeFolderCount = IphoneHomeFolderCountKnown | IphoneHomePageMissing

export interface IphoneHomePageKnown {
  kind: "known"
  current: number
  total: number
}

export interface IphoneHomePageMissing {
  kind: "missing"
}

export type IphoneHomePage = IphoneHomePageKnown | IphoneHomePageMissing

export interface IphoneHomeStateAccepted {
  kind: "accepted"
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
  kind: "accepted"
  page: IphoneHomeAuditPage
}

export type IphoneHomeAuditPageResult = IphoneHomeAuditPageAccepted | IphoneRefused

export interface IphoneHomeAuditAccepted {
  kind: "accepted"
  pages: IphoneHomeAuditPage[]
}

export type IphoneHomeAuditResult = IphoneHomeAuditAccepted | IphoneRefused

export interface IphoneHomeFolderRead {
  kind: "accepted"
  names: string[]
}

export type IphoneHomeFolderResult = IphoneHomeFolderRead | IphoneRefused
