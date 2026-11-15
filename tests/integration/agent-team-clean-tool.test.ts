import { expect, test } from "vitest"
import { leadTools, memberTools } from "#synapse/integration/pi/agent-team"
import {
  TEAM_FIXTURE_CLEAN_EXECUTION,
  TEAM_FIXTURE_CLEAN_EXPOSURE,
  TEAM_FIXTURE_CLEAN_POLICY_TEST,
  TEAM_FIXTURE_CLEAN_TOOL,
  ToolsTeamDouble,
} from "../fixtures"

function cleanPolicy(): void {
  const team = new ToolsTeamDouble()
  expect(leadTools(team)).toContainEqual(
    expect.objectContaining({
      name: TEAM_FIXTURE_CLEAN_TOOL,
      exposure: TEAM_FIXTURE_CLEAN_EXPOSURE,
      executionMode: TEAM_FIXTURE_CLEAN_EXECUTION,
    }),
  )
  expect(memberTools(team, "worker")).not.toContainEqual(expect.objectContaining({ name: TEAM_FIXTURE_CLEAN_TOOL }))
}

test(TEAM_FIXTURE_CLEAN_POLICY_TEST, cleanPolicy)
