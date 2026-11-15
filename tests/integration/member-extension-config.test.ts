import { mkdirSync, symlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, test } from "vitest"
import {
  cleanupMemberConfigFixture,
  MEMBER_CONFIG_ALIAS,
  MEMBER_CONFIG_COMMAND,
  MEMBER_CONFIG_DISABLE_PREFIX,
  MEMBER_CONFIG_EDIT,
  MEMBER_CONFIG_EDITED_COMMAND,
  MEMBER_CONFIG_ENABLE_PREFIX,
  MEMBER_CONFIG_EXCLUDED,
  MEMBER_CONFIG_EXTENSION,
  MEMBER_CONFIG_FACTORY_EDITED,
  MEMBER_CONFIG_FILE,
  MEMBER_CONFIG_INVALID,
  MEMBER_CONFIG_INVALID_MESSAGE,
  MEMBER_CONFIG_MANIFEST,
  MEMBER_CONFIG_PACKAGE,
  MEMBER_CONFIG_PACKAGE_NAME,
  MEMBER_CONFIG_PROJECT_SETTINGS_DIRECTORY,
  MEMBER_CONFIG_RELOAD,
  MEMBER_CONFIG_SETTINGS,
  MEMBER_CONFIG_SUITE,
  MEMBER_CONFIG_SYMLINK,
  MEMBER_CONFIG_TEAM_EXCLUDED,
  MEMBER_CONFIG_TEAM_PATH,
  MEMBER_CONFIG_TRUST,
  memberConfigFixture,
} from "../fixtures"

async function configurationReload(): Promise<void> {
  const fixture = memberConfigFixture(true)
  try {
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension] }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions[0]?.commands.has(MEMBER_CONFIG_COMMAND)).toBe(true)
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension, `${MEMBER_CONFIG_DISABLE_PREFIX}${fixture.extension}`] }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions).toHaveLength(0)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

async function excludesBeforeImport(): Promise<void> {
  const fixture = memberConfigFixture(true)
  try {
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension, fixture.other] }),
    )
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_FILE),
      JSON.stringify({ excludedMemberExtensions: [fixture.other] }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions).toHaveLength(1)
    expect(fixture.loader.getExtensions().extensions[0]?.commands.has(MEMBER_CONFIG_COMMAND)).toBe(true)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

async function rejectsInvalidBeforeImport(): Promise<void> {
  const fixture = memberConfigFixture(true)
  try {
    writeFileSync(join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS), JSON.stringify({ extensions: [fixture.other] }))
    writeFileSync(join(fixture.agentDirectory, MEMBER_CONFIG_FILE), JSON.stringify({ excludedMemberExtensions: [2] }))
    await expect(fixture.loader.reload()).rejects.toThrow(MEMBER_CONFIG_INVALID_MESSAGE)
    expect(fixture.loader.getExtensions().extensions).toHaveLength(0)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

async function trustControlsProject(): Promise<void> {
  const fixture = memberConfigFixture(false)
  try {
    const project = join(fixture.cwd, MEMBER_CONFIG_PROJECT_SETTINGS_DIRECTORY)
    mkdirSync(project)
    writeFileSync(join(project, MEMBER_CONFIG_SETTINGS), JSON.stringify({ extensions: [fixture.extension] }))
    await fixture.loader.reload()
    expect(fixture.settings.isProjectTrusted()).toBe(false)
    expect(fixture.loader.getExtensions().extensions).toHaveLength(0)
    fixture.settings.setProjectTrusted(true)
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions).toHaveLength(1)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

async function excludesTeamEntry(): Promise<void> {
  const fixture = memberConfigFixture(true)
  try {
    const team = fileURLToPath(new URL(MEMBER_CONFIG_TEAM_PATH, import.meta.url))
    writeFileSync(join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS), JSON.stringify({ extensions: [team] }))
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_FILE),
      JSON.stringify({ excludedMemberExtensions: [team] }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions).toHaveLength(0)
    expect(fixture.loader.getExtensions().runtime.pendingVirtualModelRegistrations).toHaveLength(0)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

async function excludesCanonicalAlias(): Promise<void> {
  const fixture = memberConfigFixture(true)
  try {
    const alias = join(fixture.directory, MEMBER_CONFIG_ALIAS)
    symlinkSync(fixture.other, alias)
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [alias, `${MEMBER_CONFIG_ENABLE_PREFIX}${fixture.other}`] }),
    )
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_FILE),
      JSON.stringify({ excludedMemberExtensions: [fixture.other] }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions).toHaveLength(0)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

async function editedExtensionReloads(): Promise<void> {
  const fixture = memberConfigFixture(true)
  try {
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension] }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions[0]?.commands.has(MEMBER_CONFIG_COMMAND)).toBe(true)
    writeFileSync(fixture.extension, MEMBER_CONFIG_FACTORY_EDITED)
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions[0]?.commands.has(MEMBER_CONFIG_EDITED_COMMAND)).toBe(true)
    expect(fixture.loader.getExtensions().extensions[0]?.commands.has(MEMBER_CONFIG_COMMAND)).toBe(false)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

async function packageFilterDisablesEntry(): Promise<void> {
  const fixture = memberConfigFixture(true)
  try {
    writeFileSync(
      join(fixture.directory, MEMBER_CONFIG_MANIFEST),
      JSON.stringify({ name: MEMBER_CONFIG_PACKAGE_NAME, pi: { extensions: [MEMBER_CONFIG_EXTENSION] } }),
    )
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ packages: [fixture.directory] }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions).toHaveLength(1)
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({
        packages: [{ source: fixture.directory, extensions: [MEMBER_CONFIG_DISABLE_PREFIX + MEMBER_CONFIG_EXTENSION] }],
      }),
    )
    await fixture.loader.reload()
    expect(fixture.loader.getExtensions().extensions).toHaveLength(0)
  } finally {
    cleanupMemberConfigFixture(fixture)
  }
}

function suite(): void {
  test(MEMBER_CONFIG_EDIT, editedExtensionReloads)
  test(MEMBER_CONFIG_PACKAGE, packageFilterDisablesEntry)
  test(MEMBER_CONFIG_TEAM_EXCLUDED, excludesTeamEntry)
  test(MEMBER_CONFIG_SYMLINK, excludesCanonicalAlias)
  test(MEMBER_CONFIG_RELOAD, configurationReload)
  test(MEMBER_CONFIG_EXCLUDED, excludesBeforeImport)
  test(MEMBER_CONFIG_INVALID, rejectsInvalidBeforeImport)
  test(MEMBER_CONFIG_TRUST, trustControlsProject)
}

describe(MEMBER_CONFIG_SUITE, suite)
