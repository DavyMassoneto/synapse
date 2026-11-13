import {
  COMPUTER_APP_FIELD_SEPARATOR,
  COMPUTER_APP_LINE_SEPARATOR,
  COMPUTER_APP_SIGNATURE_ABSENT,
  COMPUTER_APP_SIGNATURE_FOUND,
} from "./constants"
import { type ComputerSignatureField } from "./types"

export function computerSignatureField(output: string, field: string): ComputerSignatureField {
  for (const line of output.split(COMPUTER_APP_LINE_SEPARATOR)) {
    const separator = line.indexOf(COMPUTER_APP_FIELD_SEPARATOR)
    if (separator > 0 && line.slice(0, separator).trim() === field) {
      return { kind: COMPUTER_APP_SIGNATURE_FOUND, value: line.slice(separator + 1).trim() }
    }
  }
  return { kind: COMPUTER_APP_SIGNATURE_ABSENT }
}
