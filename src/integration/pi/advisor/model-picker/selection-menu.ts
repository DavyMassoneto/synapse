import { type AdvisorContext } from "../host"
import { CANCELLED_SELECTION, PICKER_TEXT } from "./constants"
import { type ModelSelection } from "./types"

export async function selectInitialModel(context: AdvisorContext, models: string[]): Promise<ModelSelection> {
  const options = new Map<string, ModelSelection>()
  options.set(PICKER_TEXT.disabledOption, { kind: "disabled" })
  for (const model of models) {
    options.set(model, { kind: "selected", model })
  }
  const choice = await context.ui.select(PICKER_TEXT.title, [...options.keys()])
  if (choice === undefined) {
    return CANCELLED_SELECTION
  }
  const selection = options.get(choice)
  if (selection === undefined) {
    return CANCELLED_SELECTION
  }
  return selection
}
