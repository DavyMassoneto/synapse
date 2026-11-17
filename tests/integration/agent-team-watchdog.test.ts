import { expect, test } from "vitest"
import {
  runWatchdogScenario,
  WATCHDOG_ACCEPTED,
  WATCHDOG_CLAIM,
  WATCHDOG_DEFAULT_OPTIONS,
  WATCHDOG_DESCRIPTION,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_LEAD,
  WATCHDOG_MEMBER,
  WATCHDOG_PRIVATE_DESCRIPTION,
  WATCHDOG_PROMPT,
  WATCHDOG_TASK_SUBJECT,
  WATCHDOG_TIMEOUT_MS,
  WATCHDOG_TITLE_ACTIVITY,
  WATCHDOG_TITLE_POLL,
  WATCHDOG_TITLE_TASK,
  WATCHDOG_TITLE_TIMEOUT,
  WATCHDOG_TITLE_UNCONFIRMED,
  WATCHDOG_UNCONFIRMED_NOTICE,
  WATCHDOG_UNCONFIRMED_OPTIONS,
  type WatchdogScenario,
  waitForWatchdogCondition,
} from "../fixtures"

async function expiresWithoutActivity(scenario: WatchdogScenario): Promise<void> {
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
  expect(scenario.host.notices).toHaveLength(0)
  scenario.clock.advance(1)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  expect(JSON.stringify(scenario.host.notices)).not.toContain(WATCHDOG_PRIVATE_DESCRIPTION)
  expect(JSON.stringify(scenario.host.notices)).not.toContain(scenario.directory)
}

async function activityRenewsDeadline(scenario: WatchdogScenario): Promise<void> {
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
  const session = scenario.sessions.sessions[0]
  if (!session) {
    throw new Error(WATCHDOG_TASK_SUBJECT)
  }
  const unsubscribe = session.subscribe(scenario.observation.observe.bind(scenario.observation))
  try {
    scenario.sessions.model.update()
    await waitForWatchdogCondition(scenario.observation.hasTextUpdate.bind(scenario.observation))
  } finally {
    unsubscribe()
  }
  scenario.clock.advance(1)
  expect(scenario.host.notices).toHaveLength(0)
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
}

async function pollingDoesNotRenew(scenario: WatchdogScenario): Promise<void> {
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
  scenario.team.overview()
  scenario.team.listTasks({})
  scenario.team.send(WATCHDOG_MEMBER, WATCHDOG_LEAD, WATCHDOG_PROMPT)
  scenario.clock.advance(1)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
}

async function unconfirmedStop(scenario: WatchdogScenario): Promise<void> {
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
  await waitForWatchdogCondition(scenario.observation.hasUnconfirmedNotice.bind(scenario.observation))
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_UNCONFIRMED_NOTICE)
}

async function taskRemainsAssigned(scenario: WatchdogScenario): Promise<void> {
  const created = scenario.team.createTask({
    subject: WATCHDOG_TASK_SUBJECT,
    description: WATCHDOG_DESCRIPTION,
    blockedBy: [],
    writeScopes: [],
  })
  expect(created.kind).toBe(WATCHDOG_ACCEPTED)
  if (created.kind !== WATCHDOG_ACCEPTED) {
    throw new Error(WATCHDOG_TASK_SUBJECT)
  }
  const claimed = scenario.team.updateTask(WATCHDOG_MEMBER, {
    taskId: created.task.id,
    expectedRevision: created.task.revision,
    action: WATCHDOG_CLAIM,
  })
  expect(claimed.kind).toBe(WATCHDOG_ACCEPTED)
  if (claimed.kind !== WATCHDOG_ACCEPTED) {
    throw new Error(WATCHDOG_TASK_SUBJECT)
  }
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
  expect(scenario.team.getTask(created.task.id)).toEqual(claimed)
}

test(WATCHDOG_TITLE_TIMEOUT, runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, expiresWithoutActivity))
test(WATCHDOG_TITLE_ACTIVITY, runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, activityRenewsDeadline))
test(WATCHDOG_TITLE_POLL, runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, pollingDoesNotRenew))
test(WATCHDOG_TITLE_UNCONFIRMED, runWatchdogScenario.bind(undefined, WATCHDOG_UNCONFIRMED_OPTIONS, unconfirmedStop))
test(WATCHDOG_TITLE_TASK, runWatchdogScenario.bind(undefined, WATCHDOG_DEFAULT_OPTIONS, taskRemainsAssigned))
