import { describe, expect, test } from "vitest"
import {
  composeCooldownRetry,
  composeModelRouter,
  composeResponseRules,
  selectMemberFactories,
} from "#synapse/composition"
import { collectPresentCapabilities } from "#synapse/integration"
import {
  ENTRIES_COOLDOWN,
  ENTRIES_EXPLICIT,
  ENTRIES_FAILED,
  ENTRIES_NONE,
  ENTRIES_REAL_ABSENT,
  ENTRIES_REAL_DEDUPE,
  ENTRIES_REAL_PATHS,
  ENTRIES_REGISTRATIONS,
  ENTRIES_RELOAD,
  ENTRIES_ROUTER,
  ENTRIES_ROUTER_ABSENT_REQUEST,
  ENTRIES_RULES,
  ENTRIES_SUITE,
  ENTRIES_UNAVAILABLE_MODEL,
  ENTRIES_VIRTUAL_MODEL,
  entryPathsLoader,
  explicitAndInheritedRulesLoader,
  explicitRulesLoader,
  failedPresenceLoader,
  openMemberWithoutRouter,
  SynapseHostCollector,
  ToolsTeamDouble,
} from "../fixtures"

function noneInherited(): void {
  const host = new SynapseHostCollector()
  expect(selectMemberFactories(host)).toHaveLength(0)
  expect(collectPresentCapabilities(host)).toEqual({ cooldownRetry: false, responseRules: false, modelRouter: false })
}

function inheritsRouter(): void {
  const host = new SynapseHostCollector()
  composeModelRouter(host)
  composeModelRouter(host)
  expect(selectMemberFactories(host)).toHaveLength(1)
  expect(collectPresentCapabilities(host)).toEqual({ cooldownRetry: false, responseRules: false, modelRouter: true })
}

function rulesOnce(): void {
  const host = new SynapseHostCollector()
  composeResponseRules(host)
  composeResponseRules(host)
  expect(host.contexts).toHaveLength(1)
  expect(selectMemberFactories(host)).toHaveLength(1)
}

async function reloadClearsPresence(): Promise<void> {
  const host = new SynapseHostCollector()
  const loader = await entryPathsLoader(0, host)
  const previous = loader.getExtensions().runtime
  expect(collectPresentCapabilities(host).modelRouter).toBe(true)
  previous.invalidate()
  expect(collectPresentCapabilities(host).modelRouter).toBe(false)
  await loader.reload()
  expect(loader.getExtensions().runtime).not.toBe(previous)
  expect(collectPresentCapabilities(host).modelRouter).toBe(true)
  loader.getExtensions().runtime.invalidate()
  expect(collectPresentCapabilities(host).modelRouter).toBe(false)
}

function cooldownIndependent(): void {
  const host = new SynapseHostCollector()
  composeCooldownRetry(host)
  expect(host.messageEnds).toHaveLength(1)
  expect(host.contexts).toHaveLength(0)
  expect(collectPresentCapabilities(host)).toEqual({ cooldownRetry: true, responseRules: false, modelRouter: false })
}

async function failedFactoryAbsent(): Promise<void> {
  const host = new SynapseHostCollector()
  const loader = await failedPresenceLoader(host)
  expect(loader.getExtensions().errors).toHaveLength(1)
  expect(loader.getExtensions().extensions).toHaveLength(0)
  expect(collectPresentCapabilities(host)).toEqual({ cooldownRetry: false, responseRules: false, modelRouter: false })
  loader.getExtensions().runtime.invalidate()
}

async function explicitWithoutInheritance(): Promise<void> {
  const host = new SynapseHostCollector()
  expect(selectMemberFactories(host)).toHaveLength(0)
  const loader = await explicitRulesLoader()
  expect(loader.getExtensions().errors).toHaveLength(0)
  expect(loader.getExtensions().extensions).toHaveLength(1)
  expect(loader.getExtensions().extensions[0]?.handlers.get("context")).toHaveLength(1)
  loader.getExtensions().runtime.invalidate()
}

async function loadsSevenRealPaths(): Promise<void> {
  const loader = await entryPathsLoader()
  const result = loader.getExtensions()
  expect(result.errors).toEqual([])
  expect(result.extensions).toHaveLength(7)
  const tools: number[] = []
  for (const extension of result.extensions) {
    tools.push(extension.tools.size)
  }
  expect(tools).toEqual([1, 0, 0, 0, 10, 1, 1])
  result.runtime.invalidate()
}

async function realPathDedupe(): Promise<void> {
  const loader = await explicitAndInheritedRulesLoader()
  const result = loader.getExtensions()
  expect(result.errors).toEqual([])
  expect(result.extensions).toHaveLength(2)
  expect(result.extensions[0]?.handlers.get("context")).toHaveLength(1)
  expect(result.extensions[1]?.handlers.size).toBe(0)
  result.runtime.invalidate()
}

async function disabledEntriesAreAbsent(): Promise<void> {
  for (let disabled = 0; disabled < 7; disabled++) {
    const loader = await entryPathsLoader(disabled)
    const result = loader.getExtensions()
    expect(result.errors).toEqual([])
    expect(result.extensions).toHaveLength(6)
    const expected = ENTRIES_REGISTRATIONS.toSpliced(disabled, 1)
    for (const [position, extension] of result.extensions.entries()) {
      const eventCounts: number[] = []
      for (const handlers of extension.handlers.values()) {
        eventCounts.push(handlers.length)
      }
      expect({
        eventCounts,
        tools: Array.from(extension.tools.keys()),
        commands: Array.from(extension.commands.keys()),
        events: Array.from(extension.handlers.keys()),
      }).toEqual(expected[position])
    }
    if (disabled === 3) {
      expect(result.runtime.pendingVirtualModelRegistrations).toHaveLength(0)
    } else {
      expect(result.runtime.pendingVirtualModelRegistrations).toHaveLength(1)
      expect(result.runtime.pendingVirtualModelRegistrations[0]?.definition).toMatchObject(ENTRIES_VIRTUAL_MODEL)
    }
    result.runtime.invalidate()
  }
}

async function rejectsVirtualMemberWithoutRouter(): Promise<void> {
  const host = new SynapseHostCollector()
  const loader = await entryPathsLoader(3, host)
  const result = loader.getExtensions()
  expect(collectPresentCapabilities(host).modelRouter).toBe(false)
  await expect(openMemberWithoutRouter(host, new ToolsTeamDouble())).rejects.toThrow(ENTRIES_UNAVAILABLE_MODEL)
  expect(result.runtime.pendingVirtualModelRegistrations).toHaveLength(0)
  expect(result.runtime.pendingProviderRegistrations).toHaveLength(0)
  expect(result.runtime.pendingNativeProviderRegistrations).toHaveLength(0)
  result.runtime.invalidate()
}

function suite(): void {
  test(ENTRIES_ROUTER_ABSENT_REQUEST, rejectsVirtualMemberWithoutRouter)
  test(ENTRIES_REAL_PATHS, loadsSevenRealPaths)
  test(ENTRIES_REAL_DEDUPE, realPathDedupe)
  test(ENTRIES_REAL_ABSENT, disabledEntriesAreAbsent)
  test(ENTRIES_NONE, noneInherited)
  test(ENTRIES_ROUTER, inheritsRouter)
  test(ENTRIES_RULES, rulesOnce)
  test(ENTRIES_RELOAD, reloadClearsPresence)
  test(ENTRIES_COOLDOWN, cooldownIndependent)
  test(ENTRIES_FAILED, failedFactoryAbsent)
  test(ENTRIES_EXPLICIT, explicitWithoutInheritance)
}

describe(ENTRIES_SUITE, suite)
