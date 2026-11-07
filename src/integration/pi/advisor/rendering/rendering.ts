import {
  type AgentToolResult,
  type ToolRenderResultOptions,
} from "@earendil-works/pi-coding-agent";
import { type Component, Text } from "@earendil-works/pi-tui";
import {
  type AdvisorRenderContext,
  type AdvisorRenderTheme,
  type AdvisorToolDetails,
  type AdvisorToolInput,
} from "#synapse/integration/pi/advisor/contracts";
import {
  ADDITIONAL_COLOR,
  ADVISOR_MESSAGES,
  ERROR_COLOR,
  PENDING_COLOR,
  PREVIEW_LINES,
  SUCCESS_COLOR,
  TITLE_COLOR,
} from "#synapse/integration/pi/advisor/presentation";

function textComponent(context: AdvisorRenderContext): Text {
  if (context.lastComponent instanceof Text) {
    return context.lastComponent;
  }
  return new Text("", 0, 0);
}

export function renderAdvisorCall(
  _input: AdvisorToolInput,
  theme: AdvisorRenderTheme,
  context: AdvisorRenderContext,
): Component {
  const text = textComponent(context);
  text.setText(theme.fg(TITLE_COLOR, theme.bold(ADVISOR_MESSAGES.renderTitle)));
  return text;
}

export function renderAdvisorResult(
  result: AgentToolResult<AdvisorToolDetails>,
  options: ToolRenderResultOptions,
  theme: AdvisorRenderTheme,
  context: AdvisorRenderContext,
): Component {
  const text = textComponent(context);
  if (options.isPartial) {
    text.setText(theme.fg(PENDING_COLOR, ADVISOR_MESSAGES.renderPending));
    return text;
  }

  const content: string[] = [];
  for (const block of result.content) {
    if (block.type === "text") {
      content.push(block.text);
    }
  }
  const body = content.join("\n");
  if (context.isError) {
    text.setText(theme.fg(ERROR_COLOR, body));
    return text;
  }

  const lines = body.split("\n");
  let shown = lines;
  if (!options.expanded) {
    shown = lines.slice(0, PREVIEW_LINES);
  }
  const remaining = lines.length - shown.length;
  let suffix = "";
  if (!options.expanded && remaining > 0) {
    suffix = `\n${theme.fg(ADDITIONAL_COLOR, `... (${remaining} linhas a mais)`)}`;
  }
  const model = result.details?.model;
  const title = model
    ? `${ADVISOR_MESSAGES.renderSuccess} (${model})`
    : ADVISOR_MESSAGES.renderSuccess;
  text.setText(`${theme.fg(SUCCESS_COLOR, title)}\n${shown.join("\n")}${suffix}`);
  return text;
}
