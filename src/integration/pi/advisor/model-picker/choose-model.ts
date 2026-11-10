import { type AdvisorContext } from "../host"
import { CANCELLED_SELECTION, MODEL_SELECTION_LIMIT, PICKER_TEXT } from "./constants"
import { modelReferences } from "./references"
import { searchModels } from "./search"
import { type MenuChoice, type ModelSelection } from "./types"

function selectedModel(choice: MenuChoice, options: string[]): ModelSelection {
  if (choice && options.includes(choice)) {
    return { kind: "selected", model: choice }
  }
  return CANCELLED_SELECTION
}

async function chooseFromAll(context: AdvisorContext, models: string[]): Promise<ModelSelection> {
  const choice = await context.ui.select(PICKER_TEXT.title, [PICKER_TEXT.disabledOption, ...models])
  if (choice === PICKER_TEXT.disabledOption) {
    return { kind: "disabled" }
  }
  return selectedModel(choice, models)
}

async function chooseMatch(context: AdvisorContext, matches: string[]): Promise<ModelSelection> {
  if (context.hasUI) {
    const options = matches.slice(0, MODEL_SELECTION_LIMIT)
    return selectedModel(await context.ui.select(PICKER_TEXT.title, options), options)
  }
  context.ui.notify(PICKER_TEXT.ambiguousModel, "warning")
  return CANCELLED_SELECTION
}

export async function chooseModel(context: AdvisorContext, input: string): Promise<ModelSelection> {
  const references = modelReferences(context)
  if (input.length === 0) {
    return chooseFromAll(context, references)
  }
  const matches = searchModels(references, input)
  const [match] = matches
  if (matches.length === 1 && match) {
    return { kind: "selected", model: match }
  }
  if (match) {
    return chooseMatch(context, matches)
  }
  context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error")
  return CANCELLED_SELECTION
}
