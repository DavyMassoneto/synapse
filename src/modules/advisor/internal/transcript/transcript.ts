import { type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"
import { CONTENT_LIMITS, LARGE_CONTENT_LIMIT, MINIMAL_CONTENT_LIMIT, SEPARATOR } from "./constants"
import { hasResizableContent, isHiddenShell } from "./predicates"
import { renderMessage } from "./render-message"
import { selectMessages } from "./select-messages"
import { type FittedTranscript, type PreparedMessage } from "./types"

function prepareMessage(message: TranscriptMessage): PreparedMessage {
  if (hasResizableContent(message)) {
    return { kind: "resizable", message }
  }
  return { kind: "fixed", text: renderMessage(message, LARGE_CONTENT_LIMIT) }
}

function prepareMessages(messages: TranscriptMessage[]): PreparedMessage[] {
  const prepared: PreparedMessage[] = []
  for (const message of messages) {
    if (!isHiddenShell(message)) {
      prepared.push(prepareMessage(message))
    }
  }
  return prepared
}

function renderPrepared(prepared: PreparedMessage, limit: number): string {
  if (prepared.kind === "fixed") {
    return prepared.text
  }
  return renderMessage(prepared.message, limit)
}

function fitAt(prepared: PreparedMessage[], limit: number, budget: number): FittedTranscript {
  const blocks: string[] = []
  let length = -SEPARATOR.length
  for (const entry of prepared) {
    const block = renderPrepared(entry, limit)
    length += block.length + SEPARATOR.length
    if (length > budget) {
      return { kind: "overflow" }
    }
    blocks.push(block)
  }
  return { kind: "fits", text: blocks.join(SEPARATOR) }
}

export function buildTranscript(messages: TranscriptMessage[], budget: number): string {
  if (budget <= 0) {
    return ""
  }
  const prepared = prepareMessages(messages)
  for (const limit of CONTENT_LIMITS) {
    const fitted = fitAt(prepared, limit, budget)
    if (fitted.kind === "fits") {
      return fitted.text
    }
  }
  return selectMessages(
    prepared.map((entry) => renderPrepared(entry, MINIMAL_CONTENT_LIMIT)),
    budget,
  )
}
