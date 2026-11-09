import { listDeletedPaths, parseDiff } from "../diff"
import { fetchDiff } from "../github"
import { buildSystemPrompt, reviewAll } from "../review"
import { type RuleGroup } from "../rules"
import { renderSources } from "../source"
import { describeTree } from "../tree"
import { type Collected, type Execution } from "./types"

export async function collectReview(execution: Execution, groups: RuleGroup[]): Promise<Collected> {
  const { settings, ports } = execution
  const diff = await fetchDiff(ports.runner, settings)
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
