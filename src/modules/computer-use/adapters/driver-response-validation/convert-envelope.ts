import { type ComputerDriverEnvelope } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_RESPONSE_DELIVERED_PROPERTY,
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
import { COMPUTER_RAW_STATE_SCHEMA } from "./schemas"
import { type ComputerRawEnvelope, type ComputerRawState } from "./types"

function computerStateEnvelope(state: ComputerRawState): ComputerDriverEnvelope {
  const result: ComputerDriverEnvelope = {
    message: "",
    isError: false,
    windows: [],
    applications: [],
    elements: [],
    tree: "",
    image: computerImageFromDriverState(state),
  }
  if (state.message) {
    result.message = state.message
  }
  if (state.windows) {
    result.windows = state.windows.map(computerConvertDriverWindow)
  }
  if (state.apps) {
    result.applications = state.apps.map(computerConvertDriverApp)
  }
  if (state.elements) {
    result.elements = state.elements.map(computerConvertDriverElement)
    const app = result.windows[0]?.app
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
  for (const part of raw.content) {
    if (part.type === COMPUTER_RPC_IMAGE_PART) {
      result.image = computerConvertDriverImage(part.data, part.mimeType)
    } else if (part.type === COMPUTER_RPC_TEXT_PART) {
      if (!raw.structuredContent) {
        result = computerTextEnvelope(result, part.text)
      } else if (raw.isError && !result.message) {
        result.message = part.text
      }
    }
  }
  result.isError = raw.isError === true
  return result
}

function computerTextEnvelope(result: ComputerDriverEnvelope, text: string): ComputerDriverEnvelope {
  if (text.trim().startsWith(COMPUTER_RESPONSE_JSON_START)) {
    return computerStateEnvelope(computerParseDriverJson(COMPUTER_RAW_STATE_SCHEMA, text))
  }
  result.message = text
  result.tree = text
  return result
}

function computerAssignDriverEvidence(result: ComputerDriverEnvelope, state: ComputerRawState): void {
  if (COMPUTER_RESPONSE_VERIFIED_PROPERTY in state) {
    result.verified = state.verified
  }
  if (state.effect) {
    result.effect = state.effect
  }
  if (state.code) {
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
