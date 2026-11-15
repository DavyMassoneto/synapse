import { afterAll, beforeAll, test } from "vitest"
import {
  SUPERVISED_TEST_NATIVE_BURST_TITLE,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SupervisedForkBurst,
} from "../fixtures"

const trials: SupervisedForkBurst[] = []

async function prepareBursts(): Promise<void> {
  if (process.platform !== SUPERVISED_TEST_WINDOWS) {
    const preparations: Promise<void>[] = []
    for (let index = 0; index < 30; index++) {
      const trial = new SupervisedForkBurst()
      trials.push(trial)
      preparations.push(trial.prepare(index))
    }
    await Promise.all(preparations)
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

beforeAll(prepareBursts, SUPERVISED_TEST_TIMEOUT_MS)
afterAll(closeBursts, SUPERVISED_TEST_TIMEOUT_MS)
test.skipIf(process.platform === SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_NATIVE_BURST_TITLE,
  thirtyForkBursts,
  SUPERVISED_TEST_TIMEOUT_MS,
)
