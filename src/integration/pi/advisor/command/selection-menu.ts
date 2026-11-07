import type { AdvisorContext } from "../contracts";
import { COMMAND_TEXT } from "../presentation";
import type { ModelSelection } from "./selection-types";

export async function selectInitialModel(
  context: AdvisorContext,
  models: string[],
): Promise<ModelSelection> {
  const options = new Map<string, ModelSelection>();
  options.set(COMMAND_TEXT.disabledOption, { kind: "disabled" });
  for (const model of models) {
    options.set(model, { kind: "selected", model });
  }
  const choice = await context.ui.select(COMMAND_TEXT.title, [...options.keys()]);
  if (choice === undefined) {
    return { kind: "cancelled" };
  }
  return options.get(choice) ?? { kind: "cancelled" };
}
