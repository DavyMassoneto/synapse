import { test } from "vitest"
import { SHELL_KEEPER_BARRIER_TEST_TITLE, SHELL_KEEPER_OLD_KILL_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { KeeperBarrierScenario } from "./keeper-barrier-support"

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
    scenario.assertOldKillRejected()
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === "win32")(SHELL_KEEPER_BARRIER_TEST_TITLE, heldBarrierIsLive, SHELL_NATIVE_TEST_MS)
test.skipIf(process.platform === "win32")(SHELL_KEEPER_OLD_KILL_TITLE, oldKillIsNotLive, SHELL_NATIVE_TEST_MS)
