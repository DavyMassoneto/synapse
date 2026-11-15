import { type ExtensionToolContext } from "@earendil-works/pi-coding-agent"
import {
  type TeamModelToolSignal,
  type TeamModelToolUpdate,
  type TeamNoInput,
  type TeamRegisteredTool,
  type TeamToolOutput,
} from "#synapse/integration/pi/agent-team"
import { TEAM_FIXTURE_ACCESS_DONE, TEAM_FIXTURE_ACCESS_TEXT } from "./tools"

export class TeamToolAccessProbe {
  readonly errors: boolean[] = []
  readonly texts: string[] = []
  private readonly tools: TeamRegisteredTool[]

  constructor(tools: TeamRegisteredTool[]) {
    this.tools = tools
  }

  async execute(
    _id: string,
    _input: TeamNoInput,
    _signal: TeamModelToolSignal,
    _update: TeamModelToolUpdate,
    context: ExtensionToolContext,
  ): Promise<TeamToolOutput> {
    for (const tool of this.tools) {
      const result = await context.executeTool(tool.name, {})
      this.errors.push(result.isError === true)
      for (const block of result.result.content) {
        if (block.type === TEAM_FIXTURE_ACCESS_TEXT) {
          this.texts.push(block.text)
        }
      }
    }
    return {
      content: [{ type: TEAM_FIXTURE_ACCESS_TEXT, text: TEAM_FIXTURE_ACCESS_DONE }],
      details: { text: TEAM_FIXTURE_ACCESS_DONE },
      isError: false,
    }
  }
}
