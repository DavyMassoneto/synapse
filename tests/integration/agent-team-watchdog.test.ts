import { expect, test } from "vitest"
import {
  WATCHDOG_ACCEPTED,
  WATCHDOG_CLAIM,
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
  WatchdogFixture,
  waitForWatchdogCondition,
} from "../fixtures"

async function expiresWithoutActivity(): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start({ shell: false, failStop: false })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    expect(scenario.host.notices).toHaveLength(0)
    scenario.clock.advance(1)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
    expect(JSON.stringify(scenario.host.notices)).not.toContain(WATCHDOG_PRIVATE_DESCRIPTION)
    expect(JSON.stringify(scenario.host.notices)).not.toContain(scenario.directory)
  } finally {
    await fixture.close()
  }
}

async function activityRenewsDeadline(): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start({ shell: false, failStop: false })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    scenario.observation.markTimers()
    scenario.sessions.model.update()
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    scenario.clock.advance(1)
    expect(scenario.host.notices).toHaveLength(0)
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  } finally {
    await fixture.close()
  }
}

async function pollingDoesNotRenew(): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start({ shell: false, failStop: false })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 1)
    scenario.team.overview()
    scenario.team.listTasks({})
    scenario.team.send(WATCHDOG_MEMBER, WATCHDOG_LEAD, WATCHDOG_PROMPT)
    scenario.clock.advance(1)
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
  } finally {
    await fixture.close()
  }
}

async function unconfirmedStop(): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start({ shell: false, failStop: true })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
    scenario.clock.advance(WATCHDOG_TIMEOUT_MS)
    await waitForWatchdogCondition(scenario.observation.hasUnconfirmedNotice.bind(scenario.observation))
    expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_UNCONFIRMED_NOTICE)
  } finally {
    await fixture.close()
  }
}

async function taskRemainsAssigned(): Promise<void> {
  const fixture = new WatchdogFixture()
  try {
    const scenario = await fixture.start({ shell: false, failStop: false })
    await waitForWatchdogCondition(scenario.observation.hasNewTimer.bind(scenario.observation))
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
  } finally {
    await fixture.close()
  }
}

test(WATCHDOG_TITLE_TIMEOUT, expiresWithoutActivity)
test(WATCHDOG_TITLE_ACTIVITY, activityRenewsDeadline)
test(WATCHDOG_TITLE_POLL, pollingDoesNotRenew)
test(WATCHDOG_TITLE_UNCONFIRMED, unconfirmedStop)
test(WATCHDOG_TITLE_TASK, taskRemainsAssigned)
