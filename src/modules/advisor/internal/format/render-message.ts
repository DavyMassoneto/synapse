import type { TranscriptMessage } from "#synapse/modules/advisor/public/contracts";
import { messageLabel } from "./message-label";
import { renderBlocks } from "./render-blocks";

export function renderMessage(message: TranscriptMessage, limit: number): string {
  if (message.kind === "shell" && message.hidden) {
    return "";
  }
  return renderBlocks(message, limit, messageLabel(message));
}
