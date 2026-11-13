export interface IphoneAccepted {
  kind: "accepted"
}

export interface IphoneRefused {
  kind: "refused"
  message: string
}

export type IphoneSupportResult = IphoneAccepted | IphoneRefused
