import { type AdvisorContext } from "../host"
import { CANCELLED_SELECTION, MODEL_SELECTION_LIMIT, PICKER_TEXT } from "./constants"
import { modelReferences } from "./references"
import { searchModels } from "./search"
import { selectedModel } from "./selected-model"
import { selectInitialModel } from "./selection-menu"
import { type ModelSelection } from "./types"

async function chooseMatch(context: AdvisorContext, matches: string[]): Promise<ModelSelection> {
  if (context.hasUI) {
    return selectedModel(await context.ui.select(PICKER_TEXT.title, matches.slice(0, MODEL_SELECTION_LIMIT)))
  }
  context.ui.notify(PICKER_TEXT.ambiguousModel, "warning")
  return CANCELLED_SELECTION
}

export async function chooseModel(context: AdvisorContext, input: string): Promise<ModelSelection> {
  const references = modelReferences(context)
  if (input.length === 0) {
    return selectInitialModel(context, references)
  }
  const matches = searchModels(references, input)
  const [match] = matches
  if (matches.length === 0) {
    context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error")
    return CANCELLED_SELECTION
  }
  if (matches.length === 1 && typeof match === "string") {
    return { kind: "selected", model: match }
  }
  return chooseMatch(context, matches)
}
