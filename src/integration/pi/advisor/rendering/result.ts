import type { AgentToolResult, ToolRenderResultOptions } from "@earendil-works/pi-coding-agent";
import type { Component } from "@earendil-works/pi-tui";
import type { AdvisorRenderContext, AdvisorRenderTheme, AdvisorToolDetails } from "../contracts";
import { ERROR_COLOR, PENDING_COLOR, RENDER_TEXT } from "../presentation";
import { extractText } from "../text";
import { textComponent } from "./component";
import { renderPreview } from "./preview";

export function renderAdvisorResult(
  result: AgentToolResult<AdvisorToolDetails>,
  options: ToolRenderResultOptions,
  theme: AdvisorRenderTheme,
  context: AdvisorRenderContext,
): Component {
  const text = textComponent(context);
  if (options.isPartial) {
    text.setText(theme.fg(PENDING_COLOR, RENDER_TEXT.pending));
    return text;
  }
  const body = extractText(result.content);
  if (context.isError) {
    text.setText(theme.fg(ERROR_COLOR, body));
    return text;
  }
  text.setText(renderPreview(body, result.details?.model, options.expanded, theme));
  return text;
}
