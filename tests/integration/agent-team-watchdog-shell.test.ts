import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import {
  createWatchdogScenario,
  WATCHDOG_DIRECTORY,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_MEMBER,
  WATCHDOG_PRIVATE_DESCRIPTION,
  WATCHDOG_PROMPT,
  WATCHDOG_TEST_TIMEOUT_MS,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_SHELL,
  waitForWatchdogChild,
  waitForWatchdogChildExit,
  waitForWatchdogCondition,
} from "../fixtures"

async function terminatesRealShell(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), WATCHDOG_DIRECTORY))
  const scenario = createWatchdogScenario(directory)
  scenario.sessions.model.shell = true
  try {
    await scenario.team.start({
      name: WATCHDOG_MEMBER,
      description: WATCHDOG_PRIVATE_DESCRIPTION,
      task: WATCHDOG_PROMPT,
    })
    const pid = await waitForWatchdogChild(directory)
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
    await waitForWatchdogChildExit(pid)
    await waitForWatchdogCondition(scenario.observation.isSettled.bind(scenario.observation))
    expect(scenario.sessions.sessions[0]?.isStreaming).toBe(false)
  } finally {
    scenario.sessions.model.finish()
    try {
      await scenario.team.suspend()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }
}

test(WATCHDOG_TITLE_SHELL, terminatesRealShell, WATCHDOG_TEST_TIMEOUT_MS)
