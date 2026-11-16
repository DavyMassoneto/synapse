import { afterAll, beforeAll, test } from "vitest"
import {
  SUPERVISED_BURST_LEASE_COUNT,
  SUPERVISED_BURST_PREPARATION_HOOK_MS,
  SUPERVISED_TEST_NATIVE_BURST_TITLE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SupervisedForkBurst,
} from "../fixtures"

const trials: SupervisedForkBurst[] = []

async function prepareBursts(): Promise<void> {
  if (process.platform !== SUPERVISED_TEST_WINDOWS) {
    for (let index = 0; index < SUPERVISED_BURST_LEASE_COUNT; index++) {
      const trial = new SupervisedForkBurst()
      trials.push(trial)
      await trial.prepare(index)
    }
  }
}

async function thirtyForkBursts(): Promise<void> {
  const running: Promise<void>[] = []
  for (const [index, trial] of trials.entries()) {
    running.push(trial.run(index))
  }
  await Promise.all(running)
}

async function closeBursts(): Promise<void> {
  const closing: Promise<void>[] = []
  for (const trial of trials) {
    closing.push(trial.close())
  }
  await Promise.all(closing)
}

beforeAll(prepareBursts, SUPERVISED_BURST_PREPARATION_HOOK_MS)
afterAll(closeBursts, SUPERVISED_TEST_TIMEOUT_MS)
test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_NATIVE_BURST_TITLE,
  thirtyForkBursts,
  SUPERVISED_TEST_TIMEOUT_MS,
)
