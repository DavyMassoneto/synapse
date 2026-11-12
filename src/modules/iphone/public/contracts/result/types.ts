import { type IPHONE_ACCEPTED, type IPHONE_REFUSED } from "../constants"

export interface IphoneAccepted {
  kind: typeof IPHONE_ACCEPTED
}

export interface IphoneRefused {
  kind: typeof IPHONE_REFUSED
  message: string
}

export type IphoneSupportResult = IphoneAccepted | IphoneRefused
