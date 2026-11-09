import { type Finding } from "../model"

export interface ChunkOutcome {
  findings: Finding[]
  complete: boolean
}
