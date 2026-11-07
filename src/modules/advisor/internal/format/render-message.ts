import type { TranscriptMessage } from "#synapse/modules/advisor/public/contracts";
import { renderBlocks } from "./render-blocks";
import {
  CONTEXT_LABEL,
  ERROR_LABEL,
  SHELL_LABEL,
  SUMMARY_LABEL,
  TOOL_RESULT_LABEL,
} from "./transcript-text";

export function renderMessage(message: TranscriptMessage, limit: number): string {
  if (message.kind === "shell" && message.hidden) {
    return "";
  }

  let label = `[${message.kind}]`;
  let clipContent = false;
  if (message.kind === "toolResult") {
    let error = "";
    if (message.error) {
      error = ERROR_LABEL;
    }
    label = `[${TOOL_RESULT_LABEL} ${message.tool}${error}]`;
    clipContent = true;
  } else if (message.kind === "shell") {
    label = `[${SHELL_LABEL}] $ ${message.command}`;
    clipContent = true;
  } else if (message.kind === "custom") {
    label = `[${CONTEXT_LABEL}:${message.customType}]`;
    clipContent = true;
  } else if (message.kind === "summary") {
    label = SUMMARY_LABEL;
  }

  return renderBlocks(message, limit, label, clipContent);
}
