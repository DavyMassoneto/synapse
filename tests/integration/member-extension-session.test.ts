import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test, vi } from "vitest"
import { createPiTeamMemberSession } from "#synapse/integration/pi/agent-team"
import {
  cleanupMemberSessionFixture,
  MEMBER_CONFIG_AGENT_ENVIRONMENT,
  MEMBER_CONFIG_DISABLE_PREFIX,
  MEMBER_CONFIG_EXCLUDED_FACTORY,
  MEMBER_CONFIG_LEAD_TRUST,
  MEMBER_CONFIG_NAME,
  MEMBER_CONFIG_PROJECT_SETTINGS_DIRECTORY,
  MEMBER_CONFIG_REOPEN,
  MEMBER_CONFIG_SESSION_RELOAD,
  MEMBER_CONFIG_SESSION_RESTORE,
  MEMBER_CONFIG_SETTINGS,
  MEMBER_CONFIG_SUITE,
  memberConfigFixture,
  memberConfigSessionRequest,
  memberConfigSessions,
} from "../fixtures"

async function sessionReload(): Promise<void> {
  const fixture = memberConfigFixture(true)
  vi.stubEnv(MEMBER_CONFIG_AGENT_ENVIRONMENT, fixture.agentDirectory)
  try {
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension] }),
    )
    const request = memberConfigSessionRequest(fixture)
    const created = await createPiTeamMemberSession(request)
    try {
      expect(created.session.resourceLoader.getExtensions().extensions).toHaveLength(2)
      writeFileSync(
        join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
        JSON.stringify({ extensions: [fixture.extension, MEMBER_CONFIG_DISABLE_PREFIX + fixture.extension] }),
      )
      await created.session.reload()
      expect(created.session.resourceLoader.getExtensions().extensions).toHaveLength(1)
    } finally {
      await created.lifecycle.close()
    }
  } finally {
    cleanupMemberSessionFixture(fixture)
  }
}

async function newSessionWithPersistedConfiguration(): Promise<void> {
  const fixture = memberConfigFixture(true)
  vi.stubEnv(MEMBER_CONFIG_AGENT_ENVIRONMENT, fixture.agentDirectory)
  try {
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension] }),
    )
    const request = memberConfigSessionRequest(fixture)
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension, MEMBER_CONFIG_DISABLE_PREFIX + fixture.extension] }),
    )
    const created = await createPiTeamMemberSession(request)
    try {
      expect(created.session.resourceLoader.getExtensions().extensions).toHaveLength(1)
    } finally {
      await created.lifecycle.close()
    }
  } finally {
    cleanupMemberSessionFixture(fixture)
  }
}

async function leadContextTrustReachesMember(): Promise<void> {
  const fixture = memberConfigFixture(false)
  vi.stubEnv(MEMBER_CONFIG_AGENT_ENVIRONMENT, fixture.agentDirectory)
  try {
    const project = join(fixture.cwd, MEMBER_CONFIG_PROJECT_SETTINGS_DIRECTORY)
    mkdirSync(project)
    writeFileSync(join(project, MEMBER_CONFIG_SETTINGS), JSON.stringify({ extensions: [fixture.other] }))
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension] }),
    )
    const sut = memberConfigSessions(fixture)
    expect(sut.context.isProjectTrusted()).toBe(false)
    const opened = await sut.sessions.open({ name: MEMBER_CONFIG_NAME, description: MEMBER_CONFIG_NAME }, sut.team)
    try {
      expect(sut.context.isProjectTrusted()).toBe(false)
    } finally {
      await opened.session.dispose()
    }
  } finally {
    cleanupMemberSessionFixture(fixture)
  }
}

async function reopenWithPersistedConfiguration(): Promise<void> {
  const fixture = memberConfigFixture(false)
  vi.stubEnv(MEMBER_CONFIG_AGENT_ENVIRONMENT, fixture.agentDirectory)
  try {
    const project = join(fixture.cwd, MEMBER_CONFIG_PROJECT_SETTINGS_DIRECTORY)
    mkdirSync(project)
    writeFileSync(join(project, MEMBER_CONFIG_SETTINGS), JSON.stringify({ extensions: [fixture.other] }))
    writeFileSync(
      join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
      JSON.stringify({ extensions: [fixture.extension] }),
    )
    const sut = memberConfigSessions(fixture)
    const opened = await sut.sessions.open({ name: MEMBER_CONFIG_NAME, description: MEMBER_CONFIG_NAME }, sut.team)
    try {
      writeFileSync(fixture.extension, MEMBER_CONFIG_EXCLUDED_FACTORY)
      writeFileSync(
        join(fixture.agentDirectory, MEMBER_CONFIG_SETTINGS),
        JSON.stringify({ extensions: [fixture.extension, MEMBER_CONFIG_DISABLE_PREFIX + fixture.extension] }),
      )
      const reopened = await sut.sessions.reopen(opened.record, sut.team)
      try {
        expect(reopened.record.name).toBe(MEMBER_CONFIG_NAME)
      } finally {
        await reopened.session.dispose()
      }
    } finally {
      await opened.session.dispose()
    }
  } finally {
    cleanupMemberSessionFixture(fixture)
  }
}

function suite(): void {
  test(MEMBER_CONFIG_SESSION_RELOAD, sessionReload)
  test(MEMBER_CONFIG_REOPEN, newSessionWithPersistedConfiguration)
  test(MEMBER_CONFIG_SESSION_RESTORE, reopenWithPersistedConfiguration)
  test(MEMBER_CONFIG_LEAD_TRUST, leadContextTrustReachesMember)
}

describe(MEMBER_CONFIG_SUITE, suite)
