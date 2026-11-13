import {
  COMPUTER_APP_BUNDLE_IDENTIFIER,
  COMPUTER_APP_IDENTIFIER_FIELD,
  COMPUTER_APP_SIGNATURE_ABSENT,
  COMPUTER_APP_TEAM_IDENTIFIER_FIELD,
  COMPUTER_APP_TEAM_IDENTIFIERS,
} from "./constants"
import { computerSignatureField } from "./signature-fields"

export function hasComputerExpectedSignature(output: string): boolean {
  const identifier = computerSignatureField(output, COMPUTER_APP_IDENTIFIER_FIELD)
  const team = computerSignatureField(output, COMPUTER_APP_TEAM_IDENTIFIER_FIELD)
  if (identifier.kind === COMPUTER_APP_SIGNATURE_ABSENT || team.kind === COMPUTER_APP_SIGNATURE_ABSENT) {
    return false
  }
  return identifier.value === COMPUTER_APP_BUNDLE_IDENTIFIER && COMPUTER_APP_TEAM_IDENTIFIERS.includes(team.value)
}
