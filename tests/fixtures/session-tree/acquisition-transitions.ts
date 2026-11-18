import { setTimeout } from "node:timers/promises"
import { expect } from "vitest"
import { readTreeProbe } from "./acquisition-probe"
import {
  TREE_CLOSE_OBSERVATION_MS,
  TREE_LEAD,
  TREE_POLL_MS,
  TREE_QUIT_REASON,
  TREE_SESSION_SHUTDOWN_EVENT,
  TREE_TIMEOUT_MS,
  TREE_WAIT_FAILURE,
} from "./constants"
import { treeAgentNames } from "./observations"
import { type TreeAcquisitionScenario } from "./types"

export async function navigateTreeAcquisition(scenario: TreeAcquisitionScenario): Promise<void> {
  const leaving = scenario.session.navigateTree(scenario.root)
  await waitTreeNavigationBoundary(scenario)
  const returning = scenario.session.navigateTree(scenario.branch)
  await Promise.race([returning, setTimeout(TREE_CLOSE_OBSERVATION_MS)])
  expect(readTreeProbe(scenario.fixture)).toBe(scenario.probeBefore)
  expect(treeAgentNames(scenario.fixture.board().overview())).toEqual([TREE_LEAD])
  scenario.gate.release()
  await Promise.all([scenario.previous, scenario.navigation, leaving, returning])
}

async function waitTreeNavigationBoundary(scenario: TreeAcquisitionScenario): Promise<void> {
  const deadline = Date.now() + TREE_TIMEOUT_MS
  while (scenario.session.isCompacting) {
    if (Date.now() >= deadline) {
      throw new Error(TREE_WAIT_FAILURE)
    }
    await setTimeout(TREE_POLL_MS)
  }
}

export async function shutdownTreeAcquisition(scenario: TreeAcquisitionScenario): Promise<void> {
  const closing = scenario.session.extensionRunner.emit({ type: TREE_SESSION_SHUTDOWN_EVENT, reason: TREE_QUIT_REASON })
  await Promise.race([closing, setTimeout(TREE_CLOSE_OBSERVATION_MS)])
  expect(readTreeProbe(scenario.fixture)).toBe(scenario.probeBefore)
  scenario.gate.release()
  await Promise.all([scenario.previous, scenario.navigation, closing])
  expect(treeAgentNames(scenario.fixture.board().overview())).toEqual([TREE_LEAD])
}

export async function reloadTreeAcquisition(scenario: TreeAcquisitionScenario): Promise<void> {
  const reloading = scenario.session.reload()
  await Promise.race([reloading, setTimeout(TREE_CLOSE_OBSERVATION_MS)])
  expect(readTreeProbe(scenario.fixture)).toBe(scenario.probeBefore)
  scenario.gate.release()
  await Promise.all([scenario.previous, scenario.navigation, reloading])
}
