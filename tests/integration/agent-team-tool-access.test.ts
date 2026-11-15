import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { leadTools } from "#synapse/integration/pi/agent-team"
import {
  createTeamToolAccessSession,
  TEAM_FIXTURE_ACCESS_DIRECTORY,
  TEAM_FIXTURE_ACCESS_FAILURE,
  TEAM_FIXTURE_ACCESS_LIST,
  TEAM_FIXTURE_ACCESS_MODEL_ONLY,
  TEAM_FIXTURE_ACCESS_PROMPT,
  TEAM_FIXTURE_ACCESS_SUITE,
  TEAM_FIXTURE_DIRECT_TEST,
  TEAM_FIXTURE_EXPOSURE_TEST,
  TEAM_FIXTURE_NESTED_TEST,
  TEAM_FIXTURE_NESTED_TOOL,
  TEAM_FIXTURE_QUERY_TEST,
  TEAM_FIXTURE_QUERY_TOOL_NAMES,
  TEAM_FIXTURE_SEQUENTIAL_TEST,
  TEAM_FIXTURE_TOOL_POLICIES,
  ToolsTeamDouble,
} from "../fixtures"

let directory = ""

async function prepare(): Promise<void> {
  directory = await mkdtemp(join(tmpdir(), TEAM_FIXTURE_ACCESS_DIRECTORY))
}

async function dispose(): Promise<void> {
  await rm(directory, { recursive: true, force: true })
}

function modelOnlyTools(): void {
  const tools = leadTools(new ToolsTeamDouble())
  expect(tools).toHaveLength(10)
  for (const tool of tools) {
    expect(tool.exposure).toBe(TEAM_FIXTURE_ACCESS_MODEL_ONLY)
  }
}

function sequentialMutations(): void {
  const tools = leadTools(new ToolsTeamDouble())
  for (const expected of TEAM_FIXTURE_TOOL_POLICIES) {
    expect(tools).toContainEqual(expect.objectContaining(expected))
  }
}

function unmodifiedQueryExecution(): void {
  const tools = leadTools(new ToolsTeamDouble())
  let queries = 0
  for (const tool of tools) {
    if (TEAM_FIXTURE_QUERY_TOOL_NAMES.includes(tool.name)) {
      expect(tool.executionMode).toBeUndefined()
      queries += 1
    }
  }
  expect(queries).toBe(5)
}

async function sdkRefusesNestedAdministrativeCalls(): Promise<void> {
  const sut = await createTeamToolAccessSession(directory, TEAM_FIXTURE_NESTED_TOOL)
  try {
    await sut.session.prompt(TEAM_FIXTURE_ACCESS_PROMPT)
    expect(sut.probe.errors).toStrictEqual(Array(10).fill(true))
    expect(sut.probe.texts).toHaveLength(10)
    for (const text of sut.probe.texts) {
      expect(text).toMatch(TEAM_FIXTURE_ACCESS_FAILURE)
    }
    expect(sut.team.createInput).toBeUndefined()
    expect(sut.team.startInput).toBeUndefined()
    expect(sut.team.sender).toBe("")
    expect(sut.team.target).toBe("")
    expect(sut.session.getCallableToolNames()).toStrictEqual([TEAM_FIXTURE_NESTED_TOOL])
  } finally {
    sut.session.dispose()
  }
}

async function sdkAcceptsDirectModelCall(): Promise<void> {
  const sut = await createTeamToolAccessSession(directory, TEAM_FIXTURE_ACCESS_LIST)
  try {
    await sut.session.prompt(TEAM_FIXTURE_ACCESS_PROMPT)
    expect(sut.session.messages).toContainEqual(
      expect.objectContaining({ role: "toolResult", toolName: TEAM_FIXTURE_ACCESS_LIST, isError: false }),
    )
  } finally {
    sut.session.dispose()
  }
}

function suite(): void {
  beforeEach(prepare)
  afterEach(dispose)
  test(TEAM_FIXTURE_EXPOSURE_TEST, modelOnlyTools)
  test(TEAM_FIXTURE_SEQUENTIAL_TEST, sequentialMutations)
  test(TEAM_FIXTURE_QUERY_TEST, unmodifiedQueryExecution)
  test(TEAM_FIXTURE_NESTED_TEST, sdkRefusesNestedAdministrativeCalls)
  test(TEAM_FIXTURE_DIRECT_TEST, sdkAcceptsDirectModelCall)
}

describe(TEAM_FIXTURE_ACCESS_SUITE, suite)
