import { type TranscriptMessage } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { convertMessage } from "./message"

export function captureTranscript(context: AdvisorContext): TranscriptMessage[] {
  const transcript: TranscriptMessage[] = []
  for (const message of context.sessionManager.buildSessionProjection().messages) {
    if (message.role !== "system") {
      transcript.push(convertMessage(message))
    }
  }
  return transcript
}
