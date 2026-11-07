import { type AdvisorContext } from "#synapse/integration/pi/advisor/contracts";
import { ADVISOR_MESSAGES } from "#synapse/integration/pi/advisor/presentation";
import { type ModelCatalog } from "./catalog.ts";
import { MODEL_SELECTION_LIMIT } from "./limits.ts";
import { type ModelSelection } from "./selection-types.ts";

async function chooseInitial(
  context: AdvisorContext,
  catalog: ModelCatalog,
): Promise<ModelSelection> {
  const choice = await context.ui.select(ADVISOR_MESSAGES.title, [
    ADVISOR_MESSAGES.disabledOption,
    ...catalog.list(),
  ]);
  if (choice === undefined) {
    return { kind: "cancelled" };
  }
  if (choice === ADVISOR_MESSAGES.disabledOption) {
    return { kind: "disabled" };
  }
  return { kind: "selected", model: choice };
}

async function chooseMatch(context: AdvisorContext, matches: string[]): Promise<ModelSelection> {
  if (!context.hasUI) {
    context.ui.notify(ADVISOR_MESSAGES.ambiguousModel, "warning");
    return { kind: "cancelled" };
  }
  const choice = await context.ui.select(
    ADVISOR_MESSAGES.title,
    matches.slice(0, MODEL_SELECTION_LIMIT),
  );
  if (choice === undefined) {
    return { kind: "cancelled" };
  }
  return { kind: "selected", model: choice };
}

export async function chooseModel(
  catalog: ModelCatalog,
  context: AdvisorContext,
  input: string,
): Promise<ModelSelection> {
  if (!input) {
    return chooseInitial(context, catalog);
  }
  const matches = catalog.search(input);
  if (matches.length === 0) {
    context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error");
    return { kind: "cancelled" };
  }
  if (matches.length === 1) {
    return { kind: "selected", model: matches[0] };
  }
  return chooseMatch(context, matches);
}
