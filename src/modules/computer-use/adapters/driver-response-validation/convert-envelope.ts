import {
  COMPUTER_TIMEOUT_UNKNOWN,
  COMPUTER_TRANSPORT_UNKNOWN,
  COMPUTER_TYPE_INCOMPLETE,
  COMPUTER_WINDOW_NOT_FOUND,
  COMPUTER_WINDOW_OWNER_MISMATCH,
  type ComputerDriverEnvelope,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_RESPONSE_DELIVERED_PROPERTY,
  COMPUTER_RESPONSE_EFFECT_REFUSED,
  COMPUTER_RESPONSE_JSON_START,
  COMPUTER_RESPONSE_REQUESTED_PROPERTY,
  COMPUTER_RESPONSE_VERIFIED_PROPERTY,
  COMPUTER_RPC_IMAGE_PART,
  COMPUTER_RPC_TEXT_PART,
} from "./constants"
import {
  computerConvertDriverApp,
  computerConvertDriverElement,
  computerConvertDriverImage,
  computerConvertDriverWindow,
  computerImageFromDriverState,
} from "./convert-state"
import { computerParseDriverJson } from "./parse-driver-json"
import { isComputerStateRefused } from "./predicates"
import { COMPUTER_RAW_STATE_SCHEMA } from "./schemas"
import { type ComputerRawEnvelope, type ComputerRawState } from "./types"

function computerStateMessage(state: ComputerRawState): string {
  const candidates = [state.message, state.summary, state.refusal?.message, state.error?.message]
  for (const candidate of candidates) {
    if (candidate?.trim()) {
      return candidate
    }
  }
  return ""
}

function computerStateEnvelope(state: ComputerRawState): ComputerDriverEnvelope {
  const result: ComputerDriverEnvelope = {
    message: computerStateMessage(state),
    isError: isComputerStateRefused(state),
    windows: [],
    applications: [],
    elements: [],
    tree: "",
    image: computerImageFromDriverState(state),
  }
  if (state.windows) {
    result.windows = state.windows.map(computerConvertDriverWindow)
  }
  if (state.apps) {
    result.applications = state.apps.map(computerConvertDriverApp)
  }
  if (state.elements) {
    result.elements = state.elements.map(computerConvertDriverElement)
    let app = state.app_name
    if (!app) {
      app = result.windows[0]?.app
    }
    if (app) {
      for (const element of result.elements) {
        element.app = app
      }
    }
  }
  if (state.tree_markdown) {
    result.tree = state.tree_markdown
  }
  computerAssignDriverEvidence(result, state)
  return result
}

export function computerConvertEnvelope(raw: ComputerRawEnvelope): ComputerDriverEnvelope {
  let result = computerStateEnvelope({})
  if (raw.structuredContent) {
    result = computerStateEnvelope(raw.structuredContent)
  }
  const textMessages: string[] = []
  for (const part of raw.content) {
    if (part.type === COMPUTER_RPC_IMAGE_PART) {
      result.image = computerConvertDriverImage(part.data, part.mimeType)
    } else if (part.type === COMPUTER_RPC_TEXT_PART) {
      result = computerApplyTextPart(result, part, raw.structuredContent, textMessages)
    }
  }
  if (raw.structuredContent && !result.message.trim() && textMessages.length > 0) {
    result.message = textMessages.join("\n")
  }
  result.isError = raw.isError === true || result.isError
  return result
}

function computerApplyTextPart(
  result: ComputerDriverEnvelope,
  part: ComputerRawEnvelope["content"][number],
  structured: ComputerRawEnvelope["structuredContent"],
  textMessages: string[],
): ComputerDriverEnvelope {
  if (part.type !== COMPUTER_RPC_TEXT_PART) {
    return result
  }
  const text = part.text.trim()
  if (structured) {
    if (text && !text.startsWith(COMPUTER_RESPONSE_JSON_START)) {
      textMessages.push(part.text)
    }
    return result
  }
  if (text.startsWith(COMPUTER_RESPONSE_JSON_START)) {
    return computerStateEnvelope(computerParseDriverJson(COMPUTER_RAW_STATE_SCHEMA, text))
  }
  result.message = part.text
  result.tree = part.text
  return result
}

function computerAssignDriverEvidence(result: ComputerDriverEnvelope, state: ComputerRawState): void {
  if (COMPUTER_RESPONSE_VERIFIED_PROPERTY in state) {
    result.verified = state.verified
  }
  if (state.effect && state.effect !== COMPUTER_RESPONSE_EFFECT_REFUSED) {
    result.effect = state.effect
  }
  if (
    state.code === COMPUTER_TYPE_INCOMPLETE ||
    state.code === COMPUTER_TIMEOUT_UNKNOWN ||
    state.code === COMPUTER_TRANSPORT_UNKNOWN ||
    state.code === COMPUTER_WINDOW_NOT_FOUND ||
    state.code === COMPUTER_WINDOW_OWNER_MISMATCH
  ) {
    result.code = state.code
  }
  if (state.escalation?.recommended) {
    result.recommended = state.escalation.recommended
  }
  if (COMPUTER_RESPONSE_DELIVERED_PROPERTY in state) {
    result.deliveredChars = state.delivered_chars
  }
  if (COMPUTER_RESPONSE_REQUESTED_PROPERTY in state) {
    result.requestedChars = state.requested_chars
  }
}
