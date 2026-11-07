import type { AdvisorContext } from "../contracts";
import { COMMAND_TEXT } from "../presentation";
import { MODEL_SELECTION_LIMIT } from "./limits";
import { modelReferences } from "./references";
import { searchModels } from "./search";
import { CANCELLED_SELECTION } from "./selection-constants";
import { selectInitialModel } from "./selection-menu";
import type { ModelSelection } from "./selection-types";

async function chooseMatch(context: AdvisorContext, matches: string[]): Promise<ModelSelection> {
  if (!context.hasUI) {
    context.ui.notify(COMMAND_TEXT.ambiguousModel, "warning");
    return CANCELLED_SELECTION;
  }
  const choice = await context.ui.select(
    COMMAND_TEXT.title,
    matches.slice(0, MODEL_SELECTION_LIMIT),
  );
  if (choice === undefined) {
    return CANCELLED_SELECTION;
  }
  return { kind: "selected", model: choice };
}

export async function chooseModel(context: AdvisorContext, input: string): Promise<ModelSelection> {
  if (!input) {
    return selectInitialModel(context, modelReferences(context));
  }
  const matches = searchModels(modelReferences(context), input);
  if (matches.length === 0) {
    context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error");
    return CANCELLED_SELECTION;
  }
  if (matches.length === 1) {
    return { kind: "selected", model: matches[0] };
  }
  return chooseMatch(context, matches);
}
