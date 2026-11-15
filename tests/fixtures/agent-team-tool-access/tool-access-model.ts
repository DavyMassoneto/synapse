import { type Api, type AssistantMessage, createAssistantMessageEventStream, type Model } from "@earendil-works/pi-ai"
import { TEST_USAGE } from "../context"
import {
  TEAM_FIXTURE_ACCESS_ASSISTANT,
  TEAM_FIXTURE_ACCESS_CALL_ID,
  TEAM_FIXTURE_ACCESS_DONE,
  TEAM_FIXTURE_ACCESS_DONE_EVENT,
  TEAM_FIXTURE_ACCESS_START_EVENT,
  TEAM_FIXTURE_ACCESS_STOP,
  TEAM_FIXTURE_ACCESS_TEXT,
  TEAM_FIXTURE_ACCESS_TOOL_CALL,
  TEAM_FIXTURE_ACCESS_TOOL_USE,
} from "./constants"

export class TeamToolAccessModel {
  private readonly firstTool: string
  private turns = 0

  constructor(firstTool: string) {
    this.firstTool = firstTool
  }

  stream(model: Model<Api>) {
    const stream = createAssistantMessageEventStream()
    const first = this.turns === 0
    this.turns += 1
    const message: AssistantMessage = {
      role: TEAM_FIXTURE_ACCESS_ASSISTANT,
      api: model.api,
      provider: model.provider,
      model: model.id,
      timestamp: Date.now(),
      usage: TEST_USAGE,
      stopReason: TEAM_FIXTURE_ACCESS_STOP,
      content: [{ type: TEAM_FIXTURE_ACCESS_TEXT, text: TEAM_FIXTURE_ACCESS_DONE }],
    }
    if (first) {
      message.content = [
        { type: TEAM_FIXTURE_ACCESS_TOOL_CALL, id: TEAM_FIXTURE_ACCESS_CALL_ID, name: this.firstTool, arguments: {} },
      ]
      message.stopReason = TEAM_FIXTURE_ACCESS_TOOL_USE
    }
    stream.push({ type: TEAM_FIXTURE_ACCESS_START_EVENT, partial: message })
    const reason = first ? TEAM_FIXTURE_ACCESS_TOOL_USE : TEAM_FIXTURE_ACCESS_STOP
    stream.push({ type: TEAM_FIXTURE_ACCESS_DONE_EVENT, reason, message })
    stream.end()
    return stream
  }
}
