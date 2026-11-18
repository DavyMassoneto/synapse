import { readFileSync } from "node:fs"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import { describe, expect, test } from "vitest"
import {
  SessionTreeFixture,
  TREE_CHECKPOINT,
  TREE_CLOSE_OBSERVATION_MS,
  TREE_FILE_ENCODING,
  TREE_LEAD,
  TREE_PENDING_CLOSE_SCENARIO,
  TREE_PROBE_FILE,
  TREE_PROBE_NEWLINE,
  TREE_PROBE_SHUTDOWN_PREFIX,
  TREE_PROBE_START_PREFIX,
  TREE_ROOT_PROMPT,
  TREE_SHOW_SHUTDOWN_SCENARIO,
  TREE_SUITE,
  TREE_TIMEOUT_MS,
  TREE_USER_ROLE,
  TREE_WORKER,
  treeAgentNames,
} from "../fixtures"

async function waitsPreviousLifetime(): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    fixture.blockNextMemberClose()
    await fixture.startMember(TREE_WORKER)
    const record = fixture.memberRecord(TREE_WORKER, storage)
    const branch = storage.appendCustomEntry(TREE_CHECKPOINT)
    const first = session.navigateTree(root)
    if (!fixture.closeBarrier) {
      throw new Error(TREE_WORKER)
    }
    await fixture.closeBarrier.entered
    const second = session.navigateTree(branch)
    await Promise.race([second, setTimeout(TREE_CLOSE_OBSERVATION_MS)])
    const beforeClose = readFileSync(join(fixture.directory, TREE_PROBE_FILE), TREE_FILE_ENCODING)
    expect(beforeClose.split(TREE_PROBE_START_PREFIX + record.sessionId + TREE_PROBE_NEWLINE)).toHaveLength(2)
    expect(beforeClose).not.toContain(TREE_PROBE_SHUTDOWN_PREFIX + record.sessionId + TREE_PROBE_NEWLINE)
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD])
    fixture.closeBarrier.release()
    await Promise.all([first, second])
    const afterClose = readFileSync(join(fixture.directory, TREE_PROBE_FILE), TREE_FILE_ENCODING)
    const closed = afterClose.indexOf(TREE_PROBE_SHUTDOWN_PREFIX + record.sessionId + TREE_PROBE_NEWLINE)
    const reopened = afterClose.lastIndexOf(TREE_PROBE_START_PREFIX + record.sessionId + TREE_PROBE_NEWLINE)
    expect(closed).toBeGreaterThan(-1)
    expect(reopened).toBeGreaterThan(closed)
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD, TREE_WORKER])
    expect(fixture.errors).toEqual([])
  } finally {
    fixture.closeBarrier?.release()
    await fixture.close()
  }
}

async function preventsShowResurrection(): Promise<void> {
  const fixture = new SessionTreeFixture()
  try {
    const session = await fixture.start()
    const storage = session.sessionManager
    const root = storage.appendMessage({ role: TREE_USER_ROLE, content: TREE_ROOT_PROMPT, timestamp: Date.now() })
    await fixture.startMember(TREE_WORKER)
    const branch = storage.appendCustomEntry(TREE_CHECKPOINT)
    await session.navigateTree(root)
    fixture.shutdownDuringShow(session)
    await session.navigateTree(branch)
    await fixture.waitShutdown()
    expect(treeAgentNames(fixture.board().overview())).toEqual([TREE_LEAD])
    expect(fixture.errors).toEqual([])
  } finally {
    await fixture.close()
  }
}

function register(): void {
  test(TREE_PENDING_CLOSE_SCENARIO, waitsPreviousLifetime, TREE_TIMEOUT_MS)
  test(TREE_SHOW_SHUTDOWN_SCENARIO, preventsShowResurrection, TREE_TIMEOUT_MS)
}

describe(TREE_SUITE, register)
