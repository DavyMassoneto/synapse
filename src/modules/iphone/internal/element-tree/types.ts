import { type IPHONE_ACCEPTED, type IphoneElement, type IphoneRefused } from "#synapse/modules/iphone/public/contracts"
import {
  type IPHONE_TREE_APP_KNOWN,
  type IPHONE_TREE_APP_MISSING,
  type IPHONE_TREE_FOUND,
  type IPHONE_TREE_MISSING,
} from "./constants"

export type IphoneXmlAttributes = Map<string, string>

export interface IphoneXmlState {
  stack: string[]
  roots: number
}

export interface IphoneTreeAppKnown {
  kind: typeof IPHONE_TREE_APP_KNOWN
  name: string
}

export interface IphoneTreeAppMissing {
  kind: typeof IPHONE_TREE_APP_MISSING
}

export type IphoneTreeApp = IphoneTreeAppKnown | IphoneTreeAppMissing

export interface IphoneElementTree {
  app: IphoneTreeApp
  elements: IphoneElement[]
  truncated: boolean
}

export interface IphoneTreeAccepted {
  kind: typeof IPHONE_ACCEPTED
  tree: IphoneElementTree
}

export type IphoneTreeResult = IphoneTreeAccepted | IphoneRefused

export interface IphoneTreeFound {
  kind: typeof IPHONE_TREE_FOUND
  element: IphoneElement
}

export interface IphoneTreeMissing {
  kind: typeof IPHONE_TREE_MISSING
}

export type IphoneTreeSearch = IphoneTreeFound | IphoneTreeMissing
