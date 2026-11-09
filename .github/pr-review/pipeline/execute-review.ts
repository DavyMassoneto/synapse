import { listDeletedPaths, parseDiff } from "../diff"
import { CommandError, ModelError } from "../errors"
import { fetchDiff, publishSummary, replaceInlineComments } from "../github"
import { buildLabels, groupByLine, partitionFindings, renderFailure, renderInline, renderSummaryPages } from "../report"
import { buildSystemPrompt, reviewAll, VERDICT_OK, type Verdict } from "../review"
import { loadRuleGroups, type RuleGroup } from "../rules"
import { renderSources } from "../source"
import { describeTree } from "../tree"
import { EXIT_FAILURE, EXIT_SUCCESS } from "./constants"
import { type Collected, type Execution } from "./types"

export async function executeReview(execution: Execution): Promise<number> {
  const groups = loadRuleGroups()
  try {
    const collected = await collectReview(execution, groups)
    await publishReview(execution, groups, collected)
    return exitCodeOf(collected.result.verdict)
  } catch (error) {
    if (!(error instanceof ModelError || error instanceof CommandError)) {
      throw error
    }
    try {
      await publishSummary(
        execution.ports.runner,
        execution.settings,
        [renderFailure(error.message)],
        execution.ports.timing,
      )
    } catch (publicationError) {
      throw new AggregateError([error, publicationError], error.message)
    }
    return EXIT_FAILURE
  }
}

export async function collectReview(execution: Execution, groups: RuleGroup[]): Promise<Collected> {
  const { settings, ports } = execution
  const diff = await fetchDiff(ports.runner, settings, ports.timing)
  const files = parseDiff(diff)
  const input = { treeListing: describeTree(ports.runner), deletedPaths: listDeletedPaths(diff) }
  const result = await reviewAll({
    caller: ports.caller,
    settings,
    input,
    systemPrompt: buildSystemPrompt(ports.runner, settings, groups),
    ruleIds: groups.flatMap((group) => group.rules.map((rule) => rule.id)),
    sources: renderSources(files),
  })
  return { files, result }
}

export async function publishReview(execution: Execution, groups: RuleGroup[], collected: Collected): Promise<void> {
  const { files, result } = collected
  const labels = buildLabels(groups)
  const anchored = partitionFindings(result.findings, files).anchored
  const inline = groupByLine(anchored).map((group) => ({
    path: group.path,
    line: group.line,
    body: renderInline(labels, group),
  }))
  await replaceInlineComments(execution.ports.runner, execution.settings, inline, execution.ports.timing)
  await publishSummary(
    execution.ports.runner,
    execution.settings,
    renderSummaryPages(result, labels, files),
    execution.ports.timing,
  )
}

export function exitCodeOf(verdict: Verdict): number {
  if (verdict === VERDICT_OK) {
    return EXIT_SUCCESS
  }
  return EXIT_FAILURE
}
