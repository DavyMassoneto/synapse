import { expect, test, vi } from "vitest"
import {
  QUEUE_FIRST,
  QUEUE_INPUT,
  QUEUE_MESSAGE,
  QUEUE_NEXT,
  QUEUE_SETTLED,
  QueueFixture,
  WATCHDOG_LEAD,
  WATCHDOG_MEMBER,
} from "../fixtures"

async function preflightInterruptionIsSticky(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open(
      { interrupted: false, pending: [] },
      QUEUE_FIRST,
      false,
      QUEUE_INPUT,
    )
    await vi.waitFor(() => expect(fixture.barrier?.entered).toBe(true))
    expect(sessions.model.streams).toBe(0)
    team.interrupt(WATCHDOG_MEMBER)
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE)
    const preserved = sessions.journal.load().pending
    fixture.barrier?.release()
    await vi.waitFor(() => expect(probe.events.some((event) => event.kind === "execution_started")).toBe(true))
    await vi.waitFor(() =>
      expect(sessions.model.streams > 0 || probe.events.some((event) => event.kind === "execution_settled")).toBe(true),
    )
    if (sessions.model.streams > 0) {
      sessions.model.finish()
    }
    await vi.waitFor(() => expect(probe.events.some((event) => event.kind === "execution_settled")).toBe(true))
    expect(probe.prompts).toEqual([QUEUE_FIRST])
    expect(probe.events.some((event) => event.kind === "execution_started")).toBe(true)
    expect(probe.events.some((event) => event.kind === "execution_settled" && event.aborted)).toBe(true)
    expect(preserved).toHaveLength(2)
    expect(preserved[0]).toBe(QUEUE_FIRST)
    expect(preserved[1]).toContain(QUEUE_MESSAGE)
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: preserved })
    expect(team.overview().agents.find((row) => row.name === WATCHDOG_MEMBER)?.state).toBe("interrupted")
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_NEXT)
    await fixture.waitStreaming()
    sessions.model.finish()
    await fixture.waitSettled()
    expect(probe.prompts).toHaveLength(2)
    expect(probe.prompts[1]).toContain(QUEUE_NEXT)
    expect(probe.prompts[1]).not.toContain(QUEUE_MESSAGE)
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: preserved })
  } finally {
    await fixture.close()
  }
}

async function settledInterruptionIsSticky(): Promise<void> {
  const fixture = new QueueFixture()
  try {
    const { team, sessions, probe } = await fixture.open(
      { interrupted: false, pending: [] },
      QUEUE_FIRST,
      false,
      QUEUE_SETTLED,
    )
    await fixture.waitStreaming()
    sessions.model.finish()
    await vi.waitFor(() => expect(fixture.barrier?.entered).toBe(true))
    team.interrupt(WATCHDOG_MEMBER)
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_MESSAGE)
    const preserved = sessions.journal.load().pending
    fixture.barrier?.release()
    await vi.waitFor(() => expect(probe.events.some((event) => event.kind === "execution_settled")).toBe(true))
    expect(probe.events.some((event) => event.kind === "execution_settled" && !event.aborted)).toBe(true)
    expect(probe.prompts).toEqual([QUEUE_FIRST])
    expect(preserved).toHaveLength(2)
    expect(preserved[0]).toBe(QUEUE_FIRST)
    expect(preserved[1]).toContain(QUEUE_MESSAGE)
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: preserved })
    expect(team.overview().agents.find((row) => row.name === WATCHDOG_MEMBER)?.state).toBe("interrupted")
    team.send(WATCHDOG_LEAD, WATCHDOG_MEMBER, QUEUE_NEXT)
    await fixture.waitStreaming()
    sessions.model.finish()
    await fixture.waitSettled()
    expect(probe.prompts).toHaveLength(2)
    expect(probe.prompts[1]).toContain(QUEUE_NEXT)
    expect(probe.prompts[1]).not.toContain(QUEUE_MESSAGE)
    expect(sessions.journal.load()).toEqual({ interrupted: true, pending: preserved })
  } finally {
    await fixture.close()
  }
}

test("interrupção durante input impede confirmação e aborta start tardio", preflightInterruptionIsSticky)
test("interrupção durante settled assíncrono prevalece sobre aborted false", settledInterruptionIsSticky)
