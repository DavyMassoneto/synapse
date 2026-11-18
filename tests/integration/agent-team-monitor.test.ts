import { expect, test } from "vitest"
import { TASK_ACCEPTED, TASK_CLAIM, TASK_COMPLETE, TASK_REASSIGN, TEAM_LEAD_NAME } from "#synapse/modules/agent-team"
import {
  failMonitorRestore,
  fixtureModel,
  hasMonitorNextTurn,
  hasMonitorSettled,
  hasMonitorStreamUpdate,
  hasMonitorTool,
  hasMonitorToolUpdate,
  MONITOR_FAILURE,
  MONITOR_MEMBER_MISSING,
  MONITOR_PRIVATE_ARGUMENT,
  MONITOR_PROGRESS,
  MONITOR_TASK_SUBJECT,
  MONITOR_TOOL,
  MONITOR_TOOL_ARGUMENTS,
  MONITOR_TOOL_CALL,
  type MonitorToolControl,
  monitorList,
  monitorMember,
  monitorProgress,
  runMonitorScenario,
  settleMonitorExecution,
  TeamLeadContext,
  WATCHDOG_INITIAL_NOTICE,
  WATCHDOG_MEMBER,
  WATCHDOG_TIMEOUT_MS,
  type WatchdogScenario,
  waitForWatchdogCondition,
} from "../fixtures"

async function observesTool(scenario: WatchdogScenario, probe: MonitorToolControl): Promise<void> {
  const initial = monitorProgress(scenario)
  expect(initial.turns).toBe(1)
  expect(initial.elapsedMs).toBe(0)
  scenario.clock.advance(100)
  scenario.sessions.model.publishTool({
    type: "toolCall",
    id: MONITOR_TOOL_CALL,
    name: MONITOR_TOOL,
    arguments: MONITOR_TOOL_ARGUMENTS,
  })
  await waitForWatchdogCondition(hasMonitorTool.bind(undefined, scenario))
  expect(monitorMember(scenario).activity).toBe(MONITOR_TOOL)
  scenario.clock.advance(400)
  const active = monitorProgress(scenario)
  expect(active.elapsedMs).toBe(500)
  expect(active.tools).toEqual([{ name: MONITOR_TOOL, elapsedMs: 400 }])
  probe.emit()
  await waitForWatchdogCondition(hasMonitorToolUpdate.bind(undefined, scenario))
  expect(monitorProgress(scenario).lastSignal).toBe("tool-update")
  expect(monitorProgress(scenario).silentMs).toBe(0)
  const listed = await monitorList(scenario)
  expect(listed).toContain(MONITOR_TOOL)
  expect(listed).not.toContain(MONITOR_PRIVATE_ARGUMENT)
  expect(listed).not.toContain(MONITOR_PROGRESS)
  probe.finish()
  await waitForWatchdogCondition(hasMonitorNextTurn.bind(undefined, scenario))
  expect(monitorProgress(scenario).completedTools).toBe(1)
  expect(monitorProgress(scenario).tools).toEqual([])
  scenario.sessions.model.update()
  await waitForWatchdogCondition(hasMonitorStreamUpdate.bind(undefined, scenario))
  expect(monitorProgress(scenario).streamUpdates).toBe(1)
  scenario.sessions.model.finish()
  await waitForWatchdogCondition(hasMonitorSettled.bind(undefined, scenario))
  const finished = monitorProgress(scenario)
  scenario.clock.advance(1000)
  expect(monitorProgress(scenario).elapsedMs).toBe(finished.elapsedMs)
  expect(monitorProgress(scenario).silentMs).toBe(1000)
}

async function observesTasks(scenario: WatchdogScenario): Promise<void> {
  const created = scenario.team.createTask({
    subject: MONITOR_TASK_SUBJECT,
    description: MONITOR_TASK_SUBJECT,
    blockedBy: [],
    writeScopes: [],
  })
  expect(created.kind).toBe("accepted")
  if (created.kind !== TASK_ACCEPTED) {
    throw new Error(created.message)
  }
  const assigned = scenario.team.updateTask(TEAM_LEAD_NAME, {
    taskId: created.task.id,
    expectedRevision: created.task.revision,
    action: TASK_REASSIGN,
    owner: WATCHDOG_MEMBER,
  })
  expect(assigned.kind).toBe("accepted")
  if (assigned.kind !== TASK_ACCEPTED) {
    throw new Error(assigned.message)
  }
  scenario.clock.advance(100)
  const unbound = monitorMember(scenario).tasks
  expect(unbound).toEqual([
    expect.objectContaining({ id: "task-1", revision: 2, bound: true, ageMs: 100 }),
    expect.objectContaining({ id: created.task.id, revision: assigned.task.revision, bound: false, ageMs: 100 }),
  ])
  const claimed = scenario.team.updateTask(WATCHDOG_MEMBER, {
    taskId: created.task.id,
    expectedRevision: assigned.task.revision,
    action: TASK_CLAIM,
  })
  expect(claimed.kind).toBe("accepted")
  expect(monitorMember(scenario).tasks).toEqual([
    expect.objectContaining({ id: "task-1", revision: 2, bound: false, ageMs: 100 }),
    expect.objectContaining({ id: created.task.id, revision: assigned.task.revision + 1, bound: true, ageMs: 0 }),
  ])
  const before = scenario.team.getTask(created.task.id)
  const selected = scenario.team.selectedTask(WATCHDOG_MEMBER)
  const signals = monitorProgress(scenario)
  const timers = scenario.clock.timers.length
  await monitorList(scenario)
  await monitorList(scenario)
  expect(scenario.team.getTask(created.task.id)).toEqual(before)
  expect(scenario.team.selectedTask(WATCHDOG_MEMBER)).toEqual(selected)
  expect(monitorProgress(scenario)).toEqual(signals)
  expect(scenario.clock.timers).toHaveLength(timers)
  expect(
    scenario.team.updateTask(WATCHDOG_MEMBER, {
      taskId: created.task.id,
      expectedRevision: created.task.revision,
      action: TASK_COMPLETE,
    }).kind,
  ).toBe("refused")
  scenario.clock.advance(WATCHDOG_TIMEOUT_MS - 100)
  expect(JSON.stringify(scenario.host.notices)).toContain(WATCHDOG_INITIAL_NOTICE)
}

async function observesRuntimeFailure(scenario: WatchdogScenario): Promise<void> {
  scenario.sessions.model.fail(MONITOR_FAILURE)
  await waitForWatchdogCondition(hasMonitorSettled.bind(undefined, scenario))
  expect(monitorMember(scenario).state).toBe("failed")
  expect(monitorMember(scenario).restorationFailed).not.toBe(true)
  expect(monitorProgress(scenario).lastSignal).toBe("settled")
}

async function restoreHasUnknownSignals(scenario: WatchdogScenario): Promise<void> {
  const task = scenario.team.createTask({
    subject: MONITOR_TASK_SUBJECT,
    description: MONITOR_TASK_SUBJECT,
    blockedBy: [],
    writeScopes: [],
  })
  if (task.kind !== TASK_ACCEPTED) {
    throw new Error(task.message)
  }
  const claimed = scenario.team.updateTask(WATCHDOG_MEMBER, {
    taskId: task.task.id,
    expectedRevision: task.task.revision,
    action: TASK_CLAIM,
  })
  if (claimed.kind !== TASK_ACCEPTED) {
    throw new Error(claimed.message)
  }
  await settleMonitorExecution(scenario)
  await scenario.team.restore(scenario.sessions.records, [claimed.task])
  expect(monitorMember(scenario).tasks).toEqual([
    { id: claimed.task.id, revision: claimed.task.revision, bound: false },
  ])
  expect(monitorMember(scenario).progress).toEqual({ kind: "unknown" })
  expect(scenario.team.selectedTask(WATCHDOG_MEMBER).kind).toBe("unselected")
  expect(scenario.sessions.model.streams).toBe(1)
  const restored = await monitorList(scenario)
  expect(restored).not.toContain("lastSignalAt")
}

async function restoreReportsFailure(scenario: WatchdogScenario): Promise<void> {
  await settleMonitorExecution(scenario)
  const record = scenario.sessions.records[0]
  if (!record) {
    throw new Error(MONITOR_MEMBER_MISSING)
  }
  scenario.lead.attach(new TeamLeadContext(fixtureModel("fixture", "fixture", 100000)))
  scenario.sessions.reopen = failMonitorRestore
  await scenario.team.restore([record], [])
  expect(monitorMember(scenario).restorationFailed).toBe(true)
  expect(monitorMember(scenario).progress).toEqual({ kind: "unknown" })
  expect(scenario.team.selectedTask(WATCHDOG_MEMBER).kind).toBe("unselected")
  expect(scenario.sessions.model.streams).toBe(1)
}

test(
  "sessão real observa ferramenta e streaming sem expor argumentos nem resultados",
  runMonitorScenario.bind(undefined, observesTool),
)
test(
  "list_agents observa revisão/vínculo/idade sem alterar quadro, seleção ou watchdog",
  runMonitorScenario.bind(undefined, observesTasks),
)
test(
  "falha do runtime permanece distinta de falha de restauração",
  runMonitorScenario.bind(undefined, observesRuntimeFailure),
)
test(
  "restore real mantém sinais desconhecidos sem retomar execução",
  runMonitorScenario.bind(undefined, restoreHasUnknownSignals),
)
test(
  "falha de restauração não inventa sinais nem retoma execução",
  runMonitorScenario.bind(undefined, restoreReportsFailure),
)
