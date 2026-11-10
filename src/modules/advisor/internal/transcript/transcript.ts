import { type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"
import { LARGE_CONTENT_LIMIT, MINIMAL_CONTENT_LIMIT, ROOMY_CONTENT_LIMITS, SEPARATOR } from "./constants"
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

function joinedLength(blocks: string[]): number {
  let length = 0
  for (const block of blocks) {
    length += block.length + SEPARATOR.length
  }
  return Math.max(0, length - SEPARATOR.length)
}

function fitAt(prepared: PreparedMessage[], limit: number, budget: number): FittedTranscript {
  const blocks = prepared.map((entry) => renderPrepared(entry, limit))
  if (joinedLength(blocks) <= budget) {
    return { kind: "fits", text: blocks.join(SEPARATOR) }
  }
  return { kind: "overflow", blocks }
}

export function buildTranscript(messages: TranscriptMessage[], budget: number): string {
  if (budget <= 0) {
    return ""
  }
  const prepared = prepareMessages(messages)
  for (const limit of ROOMY_CONTENT_LIMITS) {
    const fitted = fitAt(prepared, limit, budget)
    if (fitted.kind === "fits") {
      return fitted.text
    }
  }
  const smallest = fitAt(prepared, MINIMAL_CONTENT_LIMIT, budget)
  if (smallest.kind === "fits") {
    return smallest.text
  }
  return selectMessages(smallest.blocks, budget)
}
