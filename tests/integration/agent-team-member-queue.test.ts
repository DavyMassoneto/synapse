import { expect, test, vi } from "vitest"
import {
  QUEUE_FAILURE,
  QUEUE_FIRST,
  QUEUE_MESSAGE,
  QUEUE_NEXT,
  QUEUE_OLD,
  QueueFixture,
  WATCHDOG_LEAD,
  WATCHDOG_MEMBER,
  WATCHDOG_TIMEOUT_MS,
} from "../fixtures"

async function finishedPreservesHistory(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open(
      { interrupted: true, pending: [QUEUE_OLD, QUEUE_FIRST] },
      QUEUE_FIRST,
      false,
    )
    await fixture.waitStreaming()
    sessions.model.finish()
    await fixture.waitSettled()
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: [QUEUE_OLD, QUEUE_FIRST] })
    expect(probe.prompts).toEqual([QUEUE_FIRST])
    expect(team.overview().agents.find((row) => row.name === WATCHDOG_MEMBER)?.state).toBe("finished")
    expect(team.send(WATCHDOG_MEMBER, WATCHDOG_MEMBER, QUEUE_NEXT).kind).toBe("refused")
  } finally {
    await fixture.close()
  }
}

async function manualInterruptionPreservesPending(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open({ interrupted: false, pending: [] }, QUEUE_FIRST, false)
    await fixture.waitStreaming()
    team.interrupt(WATCHDOG_MEMBER)
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE)
    await fixture.waitSettled()
    const preserved = sessions.journal.load().pending
    expect(preserved).toHaveLength(2)
    expect(preserved[0]).toBe(QUEUE_FIRST)
    expect(preserved[1]).toContain(QUEUE_MESSAGE)
    expect(sessions.journal.load().interrupted).toBe(true)
    expect(probe.prompts).toEqual([QUEUE_FIRST])
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_NEXT)
    await fixture.waitStreaming()
    sessions.model.finish()
    await fixture.waitSettled()
    expect(probe.prompts).toHaveLength(2)
    expect(probe.prompts[1]).toContain(QUEUE_NEXT)
    expect(probe.prompts[1]).not.toContain(QUEUE_FIRST)
    expect(probe.prompts[1]).not.toContain(QUEUE_MESSAGE)
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: preserved })
  } finally {
    await fixture.close()
  }
}

async function watchdogPreservesPending(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open({ interrupted: false, pending: [] }, QUEUE_FIRST, false)
    await fixture.waitStreaming()
    fixture.clock.advance(WATCHDOG_TIMEOUT_MS)
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE)
    await fixture.waitSettled()
    expect(sessions.journal.load().pending).toHaveLength(2)
    expect(sessions.journal.load().interrupted).toBe(true)
    expect(team.overview().agents.find((row) => row.name === WATCHDOG_MEMBER)?.state).toBe("interrupted")
    expect(probe.prompts).toEqual([QUEUE_FIRST])
    expect(JSON.stringify(fixture.host.notices)).toContain("Watchdog")
  } finally {
    await fixture.close()
  }
}

async function staleSettlementRejected(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open({ interrupted: false, pending: [] }, QUEUE_FIRST, false)
    await fixture.waitStreaming()
    const previous = probe.executionId
    sessions.model.finish()
    await fixture.waitSettled()
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_NEXT)
    await fixture.waitStreaming()
    const preserved = sessions.journal.load()
    probe.record({ kind: "execution_started", executionId: previous })
    probe.record({ kind: "execution_settled", executionId: previous, aborted: false })
    expect(team.overview().agents.find((row) => row.name === WATCHDOG_MEMBER)?.state).toBe("working")
    expect(sessions.journal.load()).toEqual(preserved)
    sessions.model.finish()
    await fixture.waitSettled()
    expect(sessions.journal.load()).toEqual({ interrupted: false, pending: [] })
  } finally {
    await fixture.close()
  }
}

async function failurePreservesBatch(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open(
      { interrupted: true, pending: [QUEUE_OLD] },
      QUEUE_FIRST,
      false,
    )
    await fixture.waitStreaming()
    sessions.sessions[0]?.settingsManager.setRetryEnabled(false)
    sessions.model.fail(QUEUE_FAILURE)
    await fixture.waitSettled()
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: [QUEUE_OLD, QUEUE_FIRST] })
    expect(team.overview().agents.find((row) => row.name === WATCHDOG_MEMBER)?.state).toBe("failed")
    expect(JSON.stringify(fixture.host.notices)).toContain(QUEUE_FAILURE)
    expect(probe.prompts).toEqual([QUEUE_FIRST])
  } finally {
    await fixture.close()
  }
}

async function steerResolutionIsNotAcknowledgement(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open({ interrupted: false, pending: [] }, QUEUE_FIRST, false)
    await fixture.waitStreaming()
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE)
    await vi.waitFor(() => expect(probe.steersResolved).toBeGreaterThan(0))
    sessions.model.finish()
    await vi.waitFor(() => expect(sessions.model.streams).toBeGreaterThan(1))
    sessions.model.finish()
    await fixture.waitSettled()
    expect(sessions.journal.load().pending).toHaveLength(1)
    expect(sessions.journal.load().pending[0]).toContain(QUEUE_MESSAGE)
    expect(sessions.journal.load().interrupted).toBe(true)
    expect(probe.prompts).toEqual([QUEUE_FIRST])
  } finally {
    await fixture.close()
  }
}

async function handledInputCannotConfirm(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open({ interrupted: false, pending: [] }, QUEUE_FIRST, true)
    await vi.waitFor(() => expect(fixture.handledInput.handled).toBe(true))
    probe.record({ kind: "execution_settled", executionId: probe.executionId, aborted: false })
    expect(sessions.model.streams).toBe(0)
    expect(probe.events.some((event) => event.kind === "execution_started")).toBe(false)
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: [QUEUE_FIRST] })
    expect(team.overview().agents.find((row) => row.name === WATCHDOG_MEMBER)?.state).toBe("working")
  } finally {
    await fixture.close()
  }
}

async function nativeQueueRetainsAbortedSteer(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open({ interrupted: false, pending: [] }, QUEUE_FIRST, false)
    await fixture.waitStreaming()
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE)
    await vi.waitFor(() => expect(probe.steersResolved).toBeGreaterThan(0))
    team.interrupt(WATCHDOG_MEMBER)
    await fixture.waitSettled()
    const real = sessions.sessions[0]
    expect(real?.getSteeringMessages()).toHaveLength(1)
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_NEXT)
    await fixture.waitStreaming()
    expect(probe.prompts).toHaveLength(2)
    expect(
      real?.messages.some(
        (message) => message.role === "user" && JSON.stringify(message.content).includes(QUEUE_MESSAGE),
      ),
    ).toBe(true)
    sessions.model.finish()
    await fixture.waitSettled()
  } finally {
    await fixture.close()
  }
}

test("caracterização: fila nativa do SDK reapresenta steer antigo após abort", nativeQueueRetainsAbortedSteer)
test("input handled sem agent_start não confirma o lote por settled isolado", handledInputCannotConfirm)
test("finished confirma só o lote atual e preserva históricos de texto igual e diferente", finishedPreservesHistory)
test(
  "interrupção não reinicia pendências e orientação explícita não repete mensagens antigas",
  manualInterruptionPreservesPending,
)
test("watchdog preserva lote e pendências sem reinício automático", watchdogPreservesPending)
test("evento antigo não confirma lote novo", staleSettlementRejected)
test("falha preserva o lote e a identidade do erro sem reiniciar", failurePreservesBatch)
test("steer resolvido e consumido não é confirmação confiável da fila", steerResolutionIsNotAcknowledgement)
