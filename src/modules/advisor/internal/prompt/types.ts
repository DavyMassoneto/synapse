import { type Failure } from "#synapse/modules/advisor/public/contracts"

export interface PromptReady {
  kind: "ready"
  text: string
}

export type PreparedPrompt = PromptReady | Failure
