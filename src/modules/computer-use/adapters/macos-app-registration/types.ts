import { type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerCommandRunner } from "../command-execution"
import {
  type COMPUTER_APP_REGISTERED,
  type COMPUTER_APP_REGISTRATION_REFUSED,
  type COMPUTER_APP_SIGNATURE_ABSENT,
  type COMPUTER_APP_SIGNATURE_FOUND,
} from "./constants"

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
  kind: typeof COMPUTER_APP_REGISTERED
}

export interface ComputerAppRegistrationRefused {
  kind: typeof COMPUTER_APP_REGISTRATION_REFUSED
  message: string
}

export type ComputerAppRegistrationResult = ComputerAppRegistered | ComputerAppRegistrationRefused

export interface ComputerSignatureFieldFound {
  kind: typeof COMPUTER_APP_SIGNATURE_FOUND
  value: string
}

export interface ComputerSignatureFieldAbsent {
  kind: typeof COMPUTER_APP_SIGNATURE_ABSENT
}

export type ComputerSignatureField = ComputerSignatureFieldFound | ComputerSignatureFieldAbsent
