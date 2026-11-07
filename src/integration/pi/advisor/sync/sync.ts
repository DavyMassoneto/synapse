import { type AdvisorContext, type AdvisorHost } from "@/integration/pi/advisor";
import { type Advisor } from "@/modules";

export function syncAdvisor(
  pi: Pick<AdvisorHost, "getActiveTools" | "setActiveTools">,
  advisor: Advisor,
  context: AdvisorContext,
): void {
  const result = advisor.status();
  const model = result.kind === "success" ? result.config.model : undefined;
  const active = pi.getActiveTools();

  if (model && !active.includes("advisor")) {
    pi.setActiveTools([...active, "advisor"]);
  } else if (!model && active.includes("advisor")) {
    const remaining: string[] = [];
    for (const name of active) {
      if (name !== "advisor") {
        remaining.push(name);
      }
    }
    pi.setActiveTools(remaining);
  }

  if (context.hasUI) {
    context.ui.setStatus("advisor", model ? `advisor: ${model}` : undefined);
  }
}
