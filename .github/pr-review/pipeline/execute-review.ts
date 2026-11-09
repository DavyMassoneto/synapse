import { CommandError, ModelError } from "../errors"
import { publishSummary } from "../github"
import { renderFailure } from "../report"
import { loadRuleGroups } from "../rules"
import { collectReview } from "./collect-review"
import { EXIT_FAILURE } from "./constants"
import { exitCodeOf } from "./exit-code-of"
import { publishReview } from "./publish-review"
import { type Execution } from "./types"

export async function executeReview(execution: Execution): Promise<number> {
  const groups = loadRuleGroups()
  try {
    const collected = await collectReview(execution, groups)
    await publishReview(execution, groups, collected.files, collected.result)
    return exitCodeOf(collected.result.verdict)
  } catch (error) {
    if (!(error instanceof ModelError || error instanceof CommandError)) {
      throw error
    }
    await publishSummary(execution.ports.runner, execution.settings, [renderFailure(error.message)])
    return EXIT_FAILURE
  }
}
