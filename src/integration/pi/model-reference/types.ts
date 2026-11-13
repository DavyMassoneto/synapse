export interface PiModelReferenceValid {
  kind: "valid"
  provider: string
  id: string
}

export interface PiModelReferenceInvalid {
  kind: "invalid"
}

export type PiModelReference = PiModelReferenceValid | PiModelReferenceInvalid
