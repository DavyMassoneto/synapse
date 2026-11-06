import { Text } from "@earendil-works/pi-tui";
import { type AdvisorRenderers } from "@/integration";
import { type Advisor } from "@/modules";

export function createRenderers(advisor: Advisor): AdvisorRenderers {
  return {
    renderCall(_args, theme, context) {
      const text =
        context.lastComponent instanceof Text ? context.lastComponent : new Text("", 0, 0);
      text.setText(
        theme.fg("toolTitle", theme.bold("advisor ")) +
          theme.fg("muted", advisor.config.load().model ?? ""),
      );
      return text;
    },

    renderResult(result, options, theme, context) {
      const text =
        context.lastComponent instanceof Text ? context.lastComponent : new Text("", 0, 0);
      if (options.isPartial) {
        text.setText(theme.fg("warning", "consultando..."));
        return text;
      }

      const body = result.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("\n");
      if (context.isError) {
        text.setText(theme.fg("error", body));
        return text;
      }

      const lines = body.split("\n");
      const shown = options.expanded ? lines : lines.slice(0, 8);
      const remaining = lines.length - shown.length;
      const suffix =
        !options.expanded && remaining > 0
          ? `\n${theme.fg("dim", `... (${remaining} linhas a mais)`)}`
          : "";
      text.setText(`${theme.fg("success", "✓ conselho")}\n${shown.join("\n")}${suffix}`);
      return text;
    },
  };
}
