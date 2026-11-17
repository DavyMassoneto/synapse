import { expect, test } from "vitest"
import {
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_TEST_TIMEOUT_MS,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_SHELL,
  WatchdogChildProof,
  WatchdogFixture,
  waitForWatchdogCondition,
} from "../fixtures"

async function terminatesRealShell(): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start({ shell: true, failStop: false })
    const child = new WatchdogChildProof(scenario.directory)
    await child.waitForStart()
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
    await child.waitForExit()
    await waitForWatchdogCondition(scenario.observation.isSettled.bind(scenario.observation))
    expect(scenario.sessions.sessions[0]?.isStreaming).toBe(false)
  } finally {
    await fixture.close()
  }
}

test(WATCHDOG_TITLE_SHELL, terminatesRealShell, WATCHDOG_TEST_TIMEOUT_MS)
