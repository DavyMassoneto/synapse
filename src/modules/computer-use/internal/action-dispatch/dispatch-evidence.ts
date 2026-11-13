import {
  COMPUTER_DRIVER_DISCONNECTED,
  COMPUTER_DRIVER_INVALID,
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_DRIVER_TIMEOUT,
  COMPUTER_TIMEOUT_UNKNOWN,
  COMPUTER_TRANSPORT_UNKNOWN,
  type ComputerAction,
  type ComputerDriverCallResult,
  type ComputerDriverEnvelope,
  type ComputerRecommendedAction,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerActionEvidence } from "../action-verdict"
import {
  COMPUTER_DISPATCH_DELIVERED_PROPERTY,
  COMPUTER_DISPATCH_REQUESTED_PROPERTY,
  COMPUTER_DISPATCH_VERIFIED_PROPERTY,
} from "./constants"

export function computerDriverEvidence(
  action: ComputerAction,
  response: ComputerDriverCallResult,
): ComputerActionEvidence {
  const evidence: ComputerActionEvidence = { action: action.action, ok: false, message: "" }
  if (response.kind === COMPUTER_DRIVER_RESPONSE) {
    const envelope = response.envelope
    evidence.ok = !envelope.isError
    evidence.message = envelope.message
    if (COMPUTER_DISPATCH_VERIFIED_PROPERTY in envelope) {
      evidence.verified = envelope.verified
    }
    if (envelope.effect) {
      evidence.effect = envelope.effect
    }
    if (envelope.code) {
      evidence.code = envelope.code
    }
    computerAssignRecommendation(evidence, envelope.recommended)
    computerAssignDeliveryCounts(evidence, envelope)
  } else {
    evidence.message = response.message
    if (
      response.kind === COMPUTER_DRIVER_TIMEOUT ||
      response.kind === COMPUTER_DRIVER_DISCONNECTED ||
      response.kind === COMPUTER_DRIVER_INVALID
    ) {
      evidence.code = response.kind === COMPUTER_DRIVER_TIMEOUT ? COMPUTER_TIMEOUT_UNKNOWN : COMPUTER_TRANSPORT_UNKNOWN
    }
  }
  return evidence
}

function computerAssignRecommendation(evidence: ComputerActionEvidence, recommended?: ComputerRecommendedAction): void {
  if (recommended) {
    evidence.recommended = recommended
  }
}

function computerAssignDeliveryCounts(evidence: ComputerActionEvidence, envelope: ComputerDriverEnvelope): void {
  if (COMPUTER_DISPATCH_DELIVERED_PROPERTY in envelope) {
    evidence.deliveredChars = envelope.deliveredChars
  }
  if (COMPUTER_DISPATCH_REQUESTED_PROPERTY in envelope) {
    evidence.requestedChars = envelope.requestedChars
  }
}
