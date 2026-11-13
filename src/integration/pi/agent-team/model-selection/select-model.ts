import { type Api, getSupportedThinkingLevels, type Model, type ModelThinkingLevel } from "@earendil-works/pi-ai"
import { MODEL_REFERENCE_VALID, parseModelReference, REFERENCE_SEPARATOR } from "#synapse/modules"
import {
  TEAM_AVAILABLE_MODELS,
  TEAM_MODEL_LIST_SEPARATOR,
  TEAM_NO_LEAD_MODEL,
  TEAM_SELECTION_MODEL_FIELD,
  TEAM_SELECTION_THINKING_FIELD,
  TEAM_SUPPORTED_THINKING,
  TEAM_UNKNOWN_MODEL,
  TEAM_UNSUPPORTED_THINKING,
} from "./constants"
import {
  type AvailableMemberModel,
  type MemberModelContext,
  type MemberModelSelection,
  type SelectedMemberModel,
} from "./types"

export function availableMemberModels(context: MemberModelContext): AvailableMemberModel[] {
  const options: AvailableMemberModel[] = []
  for (const model of context.modelRegistry.getAvailable()) {
    if (context.modelRegistry.hasConfiguredAuth(model)) {
      options.push({
        reference: `${model.provider}${REFERENCE_SEPARATOR}${model.id}`,
        thinkingLevels: getSupportedThinkingLevels(model),
      })
    }
  }
  return options
}

function resolveMemberModel(context: MemberModelContext, selection: MemberModelSelection): Model<Api> {
  if (TEAM_SELECTION_MODEL_FIELD in selection) {
    const reference = parseModelReference(selection.model)
    if (reference.kind === MODEL_REFERENCE_VALID) {
      const model = context.modelRegistry.find(reference.provider, reference.id)
      if (model && context.modelRegistry.hasConfiguredAuth(model)) {
        return model
      }
    }
    throw unavailableMemberModel(context, selection.model)
  }
  if (context.model) {
    return context.model
  }
  throw new Error(TEAM_NO_LEAD_MODEL)
}

function resolveMemberThinking(model: Model<Api>, thinking: string): ModelThinkingLevel {
  const levels = getSupportedThinkingLevels(model)
  const selected = levels.find((level) => level === thinking)
  if (!selected) {
    throw new Error(
      `${TEAM_UNSUPPORTED_THINKING}${thinking}${TEAM_SUPPORTED_THINKING}${levels.join(TEAM_MODEL_LIST_SEPARATOR)}`,
    )
  }
  return selected
}

export function selectMemberModel(context: MemberModelContext, selection: MemberModelSelection): SelectedMemberModel {
  const model = resolveMemberModel(context, selection)
  const thinkingLevel = selectedMemberThinking(context, selection, model)
  return { model, thinkingLevel }
}

function selectedMemberThinking(
  context: MemberModelContext,
  selection: MemberModelSelection,
  model: Model<Api>,
): ModelThinkingLevel {
  if (TEAM_SELECTION_THINKING_FIELD in selection) {
    return resolveMemberThinking(model, selection.thinking)
  }
  if (context.thinkingLevel) {
    return resolveMemberThinking(model, context.thinkingLevel)
  }
  throw new Error(TEAM_NO_LEAD_MODEL)
}

function unavailableMemberModel(context: MemberModelContext, model: string): Error {
  const available = availableMemberModels(context).map((option) => option.reference)
  return new Error(`${TEAM_UNKNOWN_MODEL}${model}${TEAM_AVAILABLE_MODELS}${available.join(TEAM_MODEL_LIST_SEPARATOR)}`)
}
