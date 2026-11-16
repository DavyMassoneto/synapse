import { expect, test } from "vitest"
import { SHELL_KEEPER_BARRIER_TEST_TITLE, SHELL_KEEPER_OLD_KILL_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { verifyBarrierStatus } from "./keeper-barrier-status"
import { KeeperBarrierScenario } from "./keeper-barrier-support"
import {
  SHELL_BARRIER_STATUS_RUNNING,
  SHELL_BARRIER_STATUS_RUNNING_TITLE,
  SHELL_BARRIER_STATUS_ZOMBIE,
  SHELL_BARRIER_STATUS_ZOMBIE_TITLE,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"

async function heldBarrierIsLive(): Promise<void> {
  const scenario = new KeeperBarrierScenario()
  await scenario.prepare()
  try {
    scenario.assertBlockedAlive()
  } finally {
    scenario.killOldGroup()
    await scenario.close()
  }
}
async function oldKillIsNotLive(): Promise<void> {
  const scenario = new KeeperBarrierScenario()
  await scenario.prepare()
  scenario.killOldGroup()
  try {
    await scenario.assertOldKillRejected()
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_KEEPER_BARRIER_TEST_TITLE,
  heldBarrierIsLive,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_KEEPER_OLD_KILL_TITLE,
  oldKillIsNotLive,
  SHELL_NATIVE_TEST_MS,
)

function activeStatusIsAccepted(): void {
  expect(verifyBarrierStatus.bind(undefined, SHELL_BARRIER_STATUS_RUNNING)).not.toThrow()
}
function zombieStatusIsRejected(): void {
  expect(verifyBarrierStatus.bind(undefined, SHELL_BARRIER_STATUS_ZOMBIE)).toThrow()
}
test(SHELL_BARRIER_STATUS_RUNNING_TITLE, activeStatusIsAccepted)
test(SHELL_BARRIER_STATUS_ZOMBIE_TITLE, zombieStatusIsRejected)
