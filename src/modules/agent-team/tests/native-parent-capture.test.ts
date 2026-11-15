import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import { expect, test } from "vitest"
import { SHELL_NATIVE_TEST_MS, SHELL_PHASE_IDENTITY_FIELD_SEPARATOR, SHELL_PHASE_MODE_JOIN_BLOCKED } from "./constants"
import { SHELL_TEST_SIGNAL_KILL } from "./native-fixture-constants"
import { NativePhaseScenario } from "./native-phase-scenario"
import { SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"
import {
  SHELL_PARENT_CAPTURE_OBSERVATION_MS,
  SHELL_PARENT_CAPTURE_OLD_MODE,
  SHELL_PARENT_CAPTURE_ORPHAN_MARKER,
  SHELL_PARENT_CAPTURE_RELEASE_CONTENT,
  SHELL_PARENT_CAPTURE_RELEASE_FILE,
  SHELL_PARENT_CAPTURE_TITLE,
} from "./parent-capture-constants"
import { type ParentCaptureState } from "./types"

async function oldOrderRetainsOutput(): Promise<void> {
  const fixture = await NativePhaseScenario.create()
  try {
    const keeper = await fixture.start(SHELL_PARENT_CAPTURE_OLD_MODE)
    const identity = (await fixture.marker(SHELL_PHASE_MODE_JOIN_BLOCKED))
      .trim()
      .split(SHELL_PHASE_IDENTITY_FIELD_SEPARATOR)
    const state: ParentCaptureState = { closed: false }
    keeper.terminal.then(markClosed.bind(undefined, state), markClosed.bind(undefined, state))
    const reservation = Number(identity[1])
    process.kill(reservation, SHELL_TEST_SIGNAL_KILL)
    await fixture.marker(SHELL_PARENT_CAPTURE_ORPHAN_MARKER)
    await setTimeout(SHELL_PARENT_CAPTURE_OBSERVATION_MS)
    expect(state.closed).toBe(false)
    await writeFile(join(fixture.directory, SHELL_PARENT_CAPTURE_RELEASE_FILE), SHELL_PARENT_CAPTURE_RELEASE_CONTENT)
    expect(await keeper.terminal).toBe(94)
  } finally {
    await writeFile(join(fixture.directory, SHELL_PARENT_CAPTURE_RELEASE_FILE), SHELL_PARENT_CAPTURE_RELEASE_CONTENT)
    await fixture.close()
  }
}

function markClosed(observation: ParentCaptureState): void {
  observation.closed = true
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_PARENT_CAPTURE_TITLE,
  oldOrderRetainsOutput,
  SHELL_NATIVE_TEST_MS,
)
