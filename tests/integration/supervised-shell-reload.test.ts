import { writeFileSync } from "node:fs"
import { expect, test } from "vitest"
import {
  closeSupervisedReloadFixture,
  createSupervisedReloadFixture,
  SUPERVISED_TEST_OVERRIDE_DESCRIPTION,
  SUPERVISED_TEST_RELOAD_ACTIVE_TITLE,
  SUPERVISED_TEST_RELOAD_DEFAULT_TITLE,
  SUPERVISED_TEST_RELOAD_INACTIVE_TITLE,
  SUPERVISED_TEST_RELOAD_REMOVAL_TITLE,
  SUPERVISED_TEST_TIMEOUT_MS,
} from "../fixtures"

async function defaultActivation(): Promise<void> {
  const scenario = await createSupervisedReloadFixture(false)
  try {
    expect(scenario.session.getActiveToolNames()).toContain("bash")
    expect(scenario.session.getToolDefinition("bash")?.description).not.toBe(SUPERVISED_TEST_OVERRIDE_DESCRIPTION)
  } finally {
    await closeSupervisedReloadFixture(scenario)
  }
}
async function inactiveOverride(): Promise<void> {
  const scenario = await createSupervisedReloadFixture(false)
  try {
    scenario.session.setActiveToolsByName([])
    writeFileSync(
      scenario.settingsFile,
      JSON.stringify({ defaultTools: ["bash"], extensions: [scenario.fixture.extension] }),
    )
    await scenario.session.reload()
    expect(scenario.session.getToolDefinition("bash")?.description).toBe(SUPERVISED_TEST_OVERRIDE_DESCRIPTION)
    expect(scenario.session.getActiveToolNames()).not.toContain("bash")
  } finally {
    await closeSupervisedReloadFixture(scenario)
  }
}
async function activeOverride(): Promise<void> {
  const scenario = await createSupervisedReloadFixture(true)
  try {
    scenario.session.setActiveToolsByName(["bash"])
    await scenario.session.reload()
    expect(scenario.session.getToolDefinition("bash")?.description).toBe(SUPERVISED_TEST_OVERRIDE_DESCRIPTION)
    expect(scenario.session.getActiveToolNames()).toContain("bash")
  } finally {
    await closeSupervisedReloadFixture(scenario)
  }
}
async function removeOverrideTransition(): Promise<void> {
  const scenario = await createSupervisedReloadFixture(true)
  try {
    scenario.session.setActiveToolsByName(["bash"])
    await scenario.session.reload()
    expect(scenario.session.getToolDefinition("bash")?.description).toBe(SUPERVISED_TEST_OVERRIDE_DESCRIPTION)
    writeFileSync(
      scenario.settingsFile,
      JSON.stringify({
        defaultTools: ["bash"],
        extensions: [scenario.fixture.extension, `-${scenario.fixture.extension}`],
      }),
    )
    await scenario.session.reload()
    expect(scenario.session.getToolDefinition("bash")?.description).not.toBe(SUPERVISED_TEST_OVERRIDE_DESCRIPTION)
    expect(scenario.session.getActiveToolNames()).toContain("bash")
  } finally {
    await closeSupervisedReloadFixture(scenario)
  }
}

test(SUPERVISED_TEST_RELOAD_DEFAULT_TITLE, defaultActivation, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_RELOAD_INACTIVE_TITLE, inactiveOverride, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_RELOAD_ACTIVE_TITLE, activeOverride, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_RELOAD_REMOVAL_TITLE, removeOverrideTransition, SUPERVISED_TEST_TIMEOUT_MS)
