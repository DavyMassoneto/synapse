import { type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerCommandRunner } from "../command-execution"

export interface ComputerAppCommandOutcome {
  succeeded: boolean
  output: string
}

export interface ComputerAppRegistrationRequest {
  platform: ComputerPlatform
  appDirectory: string
  executor: ComputerCommandRunner
}

export interface ComputerAppRegistered {
  kind: "app-registered"
}

export interface ComputerAppRegistrationRefused {
  kind: "app-registration-refused"
  message: string
}

export type ComputerAppRegistrationResult = ComputerAppRegistered | ComputerAppRegistrationRefused

export interface ComputerSignatureFieldFound {
  kind: "signature-field-found"
  value: string
}

export interface ComputerSignatureFieldAbsent {
  kind: "signature-field-absent"
}

export type ComputerSignatureField = ComputerSignatureFieldFound | ComputerSignatureFieldAbsent
