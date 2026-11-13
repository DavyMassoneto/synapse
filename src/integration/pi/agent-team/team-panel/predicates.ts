import { type TeamOverview } from "#synapse/modules"

export function isEmptyTeamOverview(overview: TeamOverview): boolean {
  return overview.agents.length <= 1 && overview.tasks.length === 0 && overview.events.length === 0
}
