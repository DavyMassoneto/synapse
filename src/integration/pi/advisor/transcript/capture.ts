import { type TranscriptMessage } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { convertMessage } from "./message"
import { isConversationMessage } from "./predicates"

export function captureTranscript(context: AdvisorContext): TranscriptMessage[] {
  return context.sessionManager.buildSessionProjection().messages.filter(isConversationMessage).map(convertMessage)
}
