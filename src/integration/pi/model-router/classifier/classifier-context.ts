import { type ClassifierChoiceQuestion, type ClassifierContext } from "@earendil-works/pi-ai"
import { type ClassifierRequest } from "#synapse/modules"
import { PI_ROUTER_CHOICE_TYPE } from "./constants"
import { type PiClassifyOptions } from "./types"

export function buildPiRouterClassifierContext(request: ClassifierRequest): ClassifierContext {
  return { state: classifierState(request), questions: { [request.question.name]: classifierQuestion(request) } }
}

function classifierQuestion(request: ClassifierRequest): ClassifierChoiceQuestion {
  const question: ClassifierChoiceQuestion = {
    type: PI_ROUTER_CHOICE_TYPE,
    instructions: request.question.instructions,
    criteria: {},
  }
  for (const option of request.question.options) {
    question.criteria[option.id] = option.criteria
  }
  return question
}

function classifierState(request: ClassifierRequest): ClassifierContext["state"] {
  const conversation = request.state.conversation
  const state: ClassifierContext["state"] = {
    current_request: conversation.currentRequest,
    history: conversation.history.map(({ index, role, content }) => ({ index, role, content })),
    omitted_messages: conversation.omittedMessages,
    image_notice: conversation.imageNotice,
    pilot: request.state.pilot,
  }
  if (typeof conversation.currentIndex === "number") {
    state.current_index = conversation.currentIndex
  }
  if (request.state.previous) {
    state.previous_selection = { model: request.state.previous.modelId }
    if (request.state.previous.effort) {
      state.previous_selection.effort = request.state.previous.effort
    }
  }
  if (request.state.selectedModel) {
    state.selected_model = request.state.selectedModel
  }
  return state
}

export function piRouterClassifierOptions(signal?: AbortSignal): PiClassifyOptions {
  const options: PiClassifyOptions = {}
  if (signal) {
    options.signal = signal
  }
  return options
}
