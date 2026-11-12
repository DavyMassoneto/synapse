import { type PI_MODEL_REFERENCE_INVALID, type PI_MODEL_REFERENCE_VALID } from "./constants"

export interface PiModelReferenceValid {
  kind: typeof PI_MODEL_REFERENCE_VALID
  provider: string
  id: string
}

export interface PiModelReferenceInvalid {
  kind: typeof PI_MODEL_REFERENCE_INVALID
}

export type PiModelReference = PiModelReferenceValid | PiModelReferenceInvalid
