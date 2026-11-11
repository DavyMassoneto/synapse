import { type Advisor, type AdvisorResult, type Config } from "#synapse/modules"
import { type AdvisorContext, ERROR_NOTICE, INFO_NOTICE } from "../host-contracts"
import { type AdvisorToolActivation, syncAdvisor } from "../lifecycle"
import { chooseModel, type ModelSelection } from "../model-picker"
import { DISABLED_NOTICE, DISABLED_STATUS, MODEL_NOTICE, THINKING_LABEL, THINKING_NOTICE } from "./constants"
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
      context.ui.notify(status.message, ERROR_NOTICE)
    } else {
      await this.execute(parseAdvisorCommand(args), status.config, context)
    }
  }

  private async execute(input: AdvisorCommandInput, config: Config, context: AdvisorContext): Promise<void> {
    if (input.kind === "disable") {
      this.disable(context)
    } else if (input.kind === "thinking") {
      this.report(context, this.advisor.configuration.setThinking(input.level), `${THINKING_NOTICE}${input.level}`)
    } else {
      await this.select(input.query, config, context)
    }
  }

  private async select(query: string, config: Config, context: AdvisorContext): Promise<void> {
    const cannotChoose = query.length === 0 && !context.hasUI
    if (cannotChoose) {
      this.showCurrent(config, context)
    } else {
      this.applySelection(context, await chooseModel(context, query))
    }
  }

  private applySelection(context: AdvisorContext, selection: ModelSelection): void {
    if (selection.kind === "disabled") {
      this.disable(context)
    } else if (selection.kind === "selected") {
      this.report(context, this.advisor.configuration.selectModel(selection.model), `${MODEL_NOTICE}${selection.model}`)
    }
  }

  private showCurrent(config: Config, context: AdvisorContext): void {
    context.ui.notify(`${MODEL_NOTICE}${this.modelLabel()}${THINKING_LABEL}${config.thinking}`, INFO_NOTICE)
  }

  private modelLabel(): string {
    const model = this.advisor.activeModel()
    if (model.kind === "active") {
      return model.model
    }
    return DISABLED_STATUS
  }

  private disable(context: AdvisorContext): void {
    this.report(context, this.advisor.configuration.disable(), DISABLED_NOTICE)
  }

  private report(context: AdvisorContext, result: AdvisorResult, success: string): void {
    if (result.kind === "failure") {
      context.ui.notify(result.message, ERROR_NOTICE)
    } else {
      syncAdvisor(this.pi, this.advisor, context)
      context.ui.notify(success, INFO_NOTICE)
    }
  }
}
