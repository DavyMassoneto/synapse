import { type IphoneElement, type IphoneRefused } from "#synapse/modules/iphone/public/contracts"

export type IphoneXmlAttributes = Map<string, string>

export interface IphoneXmlState {
  stack: string[]
  roots: number
}

export interface IphoneTreeAppKnown {
  kind: "known"
  name: string
}

export interface IphoneTreeAppMissing {
  kind: "missing"
}

export type IphoneTreeApp = IphoneTreeAppKnown | IphoneTreeAppMissing

export interface IphoneElementTree {
  app: IphoneTreeApp
  elements: IphoneElement[]
  truncated: boolean
}

export interface IphoneTreeAccepted {
  kind: "accepted"
  tree: IphoneElementTree
}

export type IphoneTreeResult = IphoneTreeAccepted | IphoneRefused

export interface IphoneTreeFound {
  kind: "found"
  element: IphoneElement
}

export interface IphoneTreeMissing {
  kind: "missing"
}

export type IphoneTreeSearch = IphoneTreeFound | IphoneTreeMissing

export interface IphoneTreeEntityValues {
  "&quot;": string
  "&apos;": string
  "&lt;": string
  "&gt;": string
  "&amp;": string
  "&#10;": string
}
