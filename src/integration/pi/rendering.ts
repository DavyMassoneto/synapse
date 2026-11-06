import { Text } from "@earendil-works/pi-tui";
import { type AdvisorRenderers, type AdvisorTool } from "@/integration";
import { type Advisor } from "@/modules";

class AdvisorRendering {
  constructor(private readonly advisor: Advisor) {}

  renderCall(
    ...args: Parameters<NonNullable<AdvisorTool["renderCall"]>>
  ): ReturnType<NonNullable<AdvisorTool["renderCall"]>> {
    const [_input, theme, context] = args;
    const text = context.lastComponent instanceof Text ? context.lastComponent : new Text("", 0, 0);
    text.setText(
      theme.fg("toolTitle", theme.bold("advisor ")) +
        theme.fg("muted", this.advisor.config.load().model ?? ""),
    );
    return text;
  }

  renderResult(
    ...args: Parameters<NonNullable<AdvisorTool["renderResult"]>>
  ): ReturnType<NonNullable<AdvisorTool["renderResult"]>> {
    const [result, options, theme, context] = args;
    const text = context.lastComponent instanceof Text ? context.lastComponent : new Text("", 0, 0);
    if (options.isPartial) {
      text.setText(theme.fg("warning", "consultando..."));
      return text;
    }

    const content: string[] = [];
    for (const block of result.content) {
      if (block.type === "text") content.push(block.text);
    }
    const body = content.join("\n");
    if (context.isError) {
      text.setText(theme.fg("error", body));
      return text;
    }

    const lines = body.split("\n");
    const shown = options.expanded ? lines : lines.slice(0, 8);
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
