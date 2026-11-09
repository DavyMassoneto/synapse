import { type Advisor, type Config } from "#synapse/modules"
import { type AdvisorContext } from "../host"
import { type AdvisorToolActivation } from "../lifecycle"
import { chooseModel } from "../model-picker"
import { applySelection } from "./apply-selection"
import { applyThinking } from "./apply-thinking"
import { currentModel } from "./current-model"
import { parseAdvisorCommand } from "./parser"
import { type AdvisorCommandInput } from "./types"

export class AdvisorCommand {
  private readonly pi: AdvisorToolActivation
  private readonly advisor: Advisor

  constructor(pi: AdvisorToolActivation, advisor: Advisor) {
    this.pi = pi
    this.advisor = advisor
  }

  async handle(args: string, context: AdvisorContext): Promise<void> {
    const status = this.advisor.configuration.status()
    if (status.kind === "failure") {
      context.ui.notify(status.message, "error")
    } else {
      await this.execute(parseAdvisorCommand(args), status.config, context)
    }
  }

  private async execute(input: AdvisorCommandInput, config: Config, context: AdvisorContext): Promise<void> {
    if (input.kind === "disable") {
      applySelection(this.pi, this.advisor, context, { kind: "disabled" })
    } else if (input.kind === "thinking") {
      applyThinking(this.pi, this.advisor, context, input.level)
    } else {
      await this.select(input.query, config, context)
    }
  }

  private async select(query: string, config: Config, context: AdvisorContext): Promise<void> {
    if (query.length === 0 && !context.hasUI) {
      context.ui.notify(`Advisor: ${currentModel(config)}, thinking ${config.thinking}`, "info")
    } else {
      applySelection(this.pi, this.advisor, context, await chooseModel(context, query))
    }
  }
}
