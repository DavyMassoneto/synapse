import { type Cancelled } from "#synapse/modules"
import {
  AMBIGUOUS_LEVEL,
  AMBIGUOUS_MODEL,
  CANCELLED_SELECTION,
  DISABLED_OPTION,
  MODEL_SELECTION_LIMIT,
  NO_MATCH,
  NO_MATCH_LEVEL,
  PICKER_TITLE,
} from "./constants"
import { modelReferences } from "./references"
import { searchModels } from "./search"
import { type MenuChoice, type ModelSelection, type PickerContext } from "./types"

function selectedModel(choice: MenuChoice, options: string[]): ModelSelection {
  if (choice && options.includes(choice)) {
    return { kind: "selected", model: choice }
  }
  return CANCELLED_SELECTION
}

async function chooseFromAll(context: PickerContext, models: string[]): Promise<ModelSelection> {
  const choice = await context.ui.select(PICKER_TITLE, [DISABLED_OPTION, ...models])
  if (choice === DISABLED_OPTION) {
    return { kind: "disabled" }
  }
  return selectedModel(choice, models)
}

async function chooseMatch(context: PickerContext, matches: string[]): Promise<ModelSelection> {
  if (context.hasUI) {
    const options = matches.slice(0, MODEL_SELECTION_LIMIT)
    return selectedModel(await context.ui.select(PICKER_TITLE, options), options)
  }
  context.ui.notify(AMBIGUOUS_MODEL, AMBIGUOUS_LEVEL)
  return CANCELLED_SELECTION
}

function reportNoMatch(context: PickerContext, input: string): Cancelled {
  context.ui.notify(`${NO_MATCH}${input}`, NO_MATCH_LEVEL)
  return CANCELLED_SELECTION
}

async function chooseSearched(context: PickerContext, input: string, matches: string[]): Promise<ModelSelection> {
  const [first, second] = matches
  if (first && second) {
    return chooseMatch(context, matches)
  }
  if (first) {
    return { kind: "selected", model: first }
  }
  return reportNoMatch(context, input)
}

export async function chooseModel(context: PickerContext, input: string): Promise<ModelSelection> {
  const references = modelReferences(context)
  if (input.length === 0) {
    return chooseFromAll(context, references)
  }
  return chooseSearched(context, input, searchModels(references, input))
}
