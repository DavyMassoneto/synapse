import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import {
  createWatchdogScenario,
  WATCHDOG_DIRECTORY,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_LEAD,
  WATCHDOG_MEMBER,
  WATCHDOG_PRIVATE_DESCRIPTION,
  WATCHDOG_PROMPT,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_RELOAD,
  WATCHDOG_TITLE_STALE,
  waitForWatchdogCondition,
} from "../fixtures"

async function oldTimerCannotAbortNewTurn(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), WATCHDOG_DIRECTORY))
  const scenario = createWatchdogScenario(directory)
  try {
    await scenario.team.start({
      name: WATCHDOG_MEMBER,
      description: WATCHDOG_PRIVATE_DESCRIPTION,
      task: WATCHDOG_PROMPT,
    })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    const oldTimer = scenario.clock.timers[0]
    expect(oldTimer).toBeDefined()
    scenario.clock.elapse(WATCHDOG_TIMEOUT_MS)
    scenario.sessions.model.finish()
    await waitForWatchdogCondition(scenario.observation.isSettled.bind(scenario.observation))
    scenario.team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, WATCHDOG_PROMPT)
    await waitForWatchdogCondition(scenario.observation.isStreaming.bind(scenario.observation))
    const count = scenario.host.notices.length
    oldTimer?.callback()
    expect(scenario.host.notices).toHaveLength(count)
    expect(scenario.sessions.sessions[0]?.isStreaming).toBe(true)
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
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

async function oldTimerCannotAbortReloadedMember(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), WATCHDOG_DIRECTORY))
  const scenario = createWatchdogScenario(directory)
  try {
    await scenario.team.start({
      name: WATCHDOG_MEMBER,
      description: WATCHDOG_PRIVATE_DESCRIPTION,
      task: WATCHDOG_PROMPT,
    })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    const oldTimer = scenario.clock.timers[0]
    expect(oldTimer).toBeDefined()
    scenario.clock.elapse(WATCHDOG_TIMEOUT_MS)
    scenario.sessions.model.finish()
    await scenario.team.suspend()
    await scenario.team.restore(scenario.sessions.records, [])
    scenario.observation.selectSession(1)
    scenario.team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, WATCHDOG_PROMPT)
    await waitForWatchdogCondition(scenario.observation.isStreaming.bind(scenario.observation))
    const count = scenario.host.notices.length
    oldTimer?.callback()
    expect(scenario.host.notices).toHaveLength(count)
    expect(scenario.sessions.sessions[1]?.isStreaming).toBe(true)
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
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

test(WATCHDOG_TITLE_STALE, oldTimerCannotAbortNewTurn)
test(WATCHDOG_TITLE_RELOAD, oldTimerCannotAbortReloadedMember)
