import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { SettingsManager } from "@earendil-works/pi-coding-agent"
import {
  createPiTeamLeadSession,
  memberTools,
  PiTeamMemberSessions,
  TeamMemberResourceLoader,
} from "#synapse/integration"
import { TeamLeadContext, TeamLeadHost, ToolsTeamDouble } from "../agent-team"
import { fixtureModel } from "../context"
import {
  MEMBER_CONFIG_AGENT_DIRECTORY,
  MEMBER_CONFIG_CONTEXT_WINDOW,
  MEMBER_CONFIG_EXCLUDED_FACTORY,
  MEMBER_CONFIG_EXTENSION,
  MEMBER_CONFIG_FACTORY,
  MEMBER_CONFIG_MODEL_ID,
  MEMBER_CONFIG_MODEL_PROVIDER,
  MEMBER_CONFIG_OTHER,
  MEMBER_CONFIG_PROJECT_DIRECTORY,
  MEMBER_CONFIG_TEMP,
} from "./constants"
import { type MemberConfigFixture, type MemberConfigSessionFixture } from "./types"

export function memberConfigFixture(trusted: boolean): MemberConfigFixture {
  const directory = mkdtempSync(join(tmpdir(), MEMBER_CONFIG_TEMP))
  const agentDirectory = join(directory, MEMBER_CONFIG_AGENT_DIRECTORY)
  const cwd = join(directory, MEMBER_CONFIG_PROJECT_DIRECTORY)
  mkdirSync(agentDirectory)
  mkdirSync(cwd)
  const extension = join(directory, MEMBER_CONFIG_EXTENSION)
  const other = join(directory, MEMBER_CONFIG_OTHER)
  writeFileSync(extension, MEMBER_CONFIG_FACTORY)
  writeFileSync(other, MEMBER_CONFIG_EXCLUDED_FACTORY)
  const settings = SettingsManager.create(cwd, agentDirectory, { projectTrusted: trusted })
  const loader = new TeamMemberResourceLoader({ cwd, agentDirectory, settings, instructions: "" })
  return { directory, agentDirectory, cwd, extension, other, settings, loader }
}

export function memberConfigSessions(fixture: MemberConfigFixture): MemberConfigSessionFixture {
  const context = new TeamLeadContext(
    fixtureModel(MEMBER_CONFIG_MODEL_PROVIDER, MEMBER_CONFIG_MODEL_ID, MEMBER_CONFIG_CONTEXT_WINDOW),
  )
  context.cwd = fixture.cwd
  context.projectTrusted = false
  const lead = createPiTeamLeadSession(new TeamLeadHost())
  lead.attach(context)
  const sessions = new PiTeamMemberSessions({ context: lead.context.bind(lead), tools: memberTools })
  return { context, sessions, team: new ToolsTeamDouble() }
}
