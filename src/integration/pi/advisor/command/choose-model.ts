import { type AdvisorContext } from "#synapse/integration/pi/advisor/index.js";
import {
  ADVISOR_MESSAGES,
  noMatchingModel,
} from "#synapse/integration/pi/advisor/presentation/index.js";
import { type ModelCatalog } from "./catalog.ts";
import { type ModelSelection } from "./selection-types.ts";

const MODEL_SELECTION_LIMIT = 100;

export async function chooseModel(
  catalog: ModelCatalog,
  context: AdvisorContext,
  input: string,
): Promise<ModelSelection> {
  if (!input) {
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

  const matches = catalog.search(input);
  if (matches.length === 0) {
    context.ui.notify(noMatchingModel(input), "error");
    return { kind: "cancelled" };
  }
  if (matches.length === 1) {
    return { kind: "selected", model: matches[0] };
  }
  if (context.hasUI) {
    const choice = await context.ui.select(
      ADVISOR_MESSAGES.title,
      matches.slice(0, MODEL_SELECTION_LIMIT),
    );
    if (choice !== undefined) {
      return { kind: "selected", model: choice };
    }
    return { kind: "cancelled" };
  }
  context.ui.notify(ADVISOR_MESSAGES.ambiguousModel, "warning");
  return { kind: "cancelled" };
}
