import { type Theme, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent";
import { type Component, Text } from "@earendil-works/pi-tui";
import {
  type AdvisorRenderCallContext,
  type AdvisorRenderCallInput,
  type AdvisorRenderers,
  type AdvisorRenderResultContext,
  type AdvisorRenderResultValue,
} from "@/integration";
import { PREVIEW_LINES, RENDER_STYLE, RENDER_TEXT } from "@/integration/pi/advisor/presentation";

class AdvisorRendering {
  renderCall(
    _input: AdvisorRenderCallInput,
    theme: Theme,
    context: AdvisorRenderCallContext,
  ): Component {
    let text: Text;
    if (context.lastComponent instanceof Text) {
      text = context.lastComponent;
    } else {
      text = new Text("", 0, 0);
    }

    text.setText(theme.fg(RENDER_STYLE.title, theme.bold(RENDER_TEXT.title)));
    return text;
  }

  renderResult(
    result: AdvisorRenderResultValue,
    options: ToolRenderResultOptions,
    theme: Theme,
    context: AdvisorRenderResultContext,
  ): Component {
    let text: Text;
    if (context.lastComponent instanceof Text) {
      text = context.lastComponent;
    } else {
      text = new Text("", 0, 0);
    }

    if (options.isPartial) {
      text.setText(theme.fg(RENDER_STYLE.pending, RENDER_TEXT.pending));
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
      text.setText(theme.fg(RENDER_STYLE.error, body));
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
      suffix = `\n${theme.fg(RENDER_STYLE.additional, `... (${remaining} linhas a mais)`)}`;
    }
    const model = result.details?.model;
    const title = model ? `${RENDER_TEXT.success} (${model})` : RENDER_TEXT.success;
    text.setText(`${theme.fg(RENDER_STYLE.success, title)}\n${shown.join("\n")}${suffix}`);
    return text;
  }
}

export function createRenderers(): AdvisorRenderers {
  const rendering = new AdvisorRendering();
  return {
    renderCall: rendering.renderCall.bind(rendering),
    renderResult: rendering.renderResult.bind(rendering),
  };
}
