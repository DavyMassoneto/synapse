import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import {
  createWatchdogScenario,
  WATCHDOG_COORD_TOOL,
  WATCHDOG_DIRECTORY,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_MEMBER,
  WATCHDOG_POLL_TOOL,
  WATCHDOG_PRIVATE_DESCRIPTION,
  WATCHDOG_PROMPT,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_SDK_COORD,
  WATCHDOG_TITLE_SDK_POLL,
  waitForWatchdogCondition,
} from "../fixtures"

async function observationalToolDoesNotRenew(tool: string): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), WATCHDOG_DIRECTORY))
  const scenario = createWatchdogScenario(directory)
  try {
    await scenario.team.start({
      name: WATCHDOG_MEMBER,
      description: WATCHDOG_PRIVATE_DESCRIPTION,
      task: WATCHDOG_PROMPT,
    })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    const timers = scenario.clock.timers.length
    scenario.sessions.model.requestTool(tool)
    scenario.sessions.model.dispatchTool()
    await waitForWatchdogCondition(scenario.observation.hasToolResult.bind(scenario.observation))
    expect(scenario.clock.timers).toHaveLength(timers)
    scenario.clock.advance(1)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  } finally {
    scenario.sessions.model.finish()
    try {
      await scenario.team.suspend()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
}

test(WATCHDOG_TITLE_SDK_POLL, observationalToolDoesNotRenew.bind(undefined, WATCHDOG_POLL_TOOL))
test(WATCHDOG_TITLE_SDK_COORD, observationalToolDoesNotRenew.bind(undefined, WATCHDOG_COORD_TOOL))
