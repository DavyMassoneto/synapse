import { type AdvisorContext } from "../host"
import { PICKER_TEXT } from "./constants"
import { selectedModel } from "./selected-model"
import { type ModelSelection } from "./types"

export async function selectInitialModel(context: AdvisorContext, models: string[]): Promise<ModelSelection> {
  const choice = await context.ui.select(PICKER_TEXT.title, [PICKER_TEXT.disabledOption, ...models])
  if (choice === PICKER_TEXT.disabledOption) {
    return { kind: "disabled" }
  }
  return selectedModel(choice, models)
}
