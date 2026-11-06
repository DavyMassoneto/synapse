import { type Theme, type ToolRenderResultOptions } from "@earendil-works/pi-coding-agent";
import { type Component, Text } from "@earendil-works/pi-tui";
import {
  type AdvisorRenderCallContext,
  type AdvisorRenderCallInput,
  type AdvisorRenderers,
  type AdvisorRenderResultContext,
  type AdvisorRenderResultValue,
} from "@/integration";
import { type Advisor } from "@/modules";

class AdvisorRendering {
  constructor(private readonly advisor: Advisor) {}

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

    const status = this.advisor.status();
    const model = status.kind === "success" ? status.status.model : undefined;
    text.setText(theme.fg("toolTitle", theme.bold("advisor ")) + theme.fg("muted", model ?? ""));
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
      text.setText(theme.fg("warning", "consultando..."));
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
      text.setText(theme.fg("error", body));
      return text;
    }

    const lines = body.split("\n");
    let shown = lines;
    if (!options.expanded) {
      shown = lines.slice(0, 8);
    }
    const remaining = lines.length - shown.length;
    let suffix = "";
    if (!options.expanded && remaining > 0) {
      suffix = `\n${theme.fg("dim", `... (${remaining} linhas a mais)`)}`;
    }
    text.setText(`${theme.fg("success", "✓ conselho")}\n${shown.join("\n")}${suffix}`);
    return text;
  }
}

export function createRenderers(advisor: Advisor): AdvisorRenderers {
  const rendering = new AdvisorRendering(advisor);
  return {
    renderCall: rendering.renderCall.bind(rendering),
    renderResult: rendering.renderResult.bind(rendering),
  };
}
