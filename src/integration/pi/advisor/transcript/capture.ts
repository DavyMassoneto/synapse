import type { TranscriptMessage } from "#synapse/modules";
import type { AdvisorContext } from "../contracts";
import { convertMessage } from "./message";

export function captureTranscript(context: AdvisorContext): TranscriptMessage[] {
  const messages = context.sessionManager.buildSessionProjection().messages;
  const transcript: TranscriptMessage[] = [];

  for (const message of messages) {
    const converted = convertMessage(message);
    if (converted !== undefined) {
      transcript.push(converted);
    }
  }
  return transcript;
}
