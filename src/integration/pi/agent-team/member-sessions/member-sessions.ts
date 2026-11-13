import { getAgentDir } from "@earendil-works/pi-coding-agent"
import {
  type AgentTeam,
  type MemberRecord,
  type MemberSessions,
  type OpenedMember,
  type OpenMemberRequest,
  REFERENCE_SEPARATOR,
} from "#synapse/modules"
import { type AgentTeamContext } from "../lead-session"
import { readMemberExtensions } from "../member-extensions"
import { selectMemberModel } from "../model-selection"
import { PiTeamSessionAdapter } from "../session-events"
import { createTeamMemberStorage, openTeamMemberStorage, PiTeamMemberJournal } from "../session-persistence"
import { TEAM_PI_MEMBER_IDENTITY_END, TEAM_PI_MEMBER_IDENTITY_START, TEAM_PI_MEMBER_WRONG_LEAD } from "./constants"
import { createPiTeamMemberSession } from "./create-member-session"
import { removeFailedMemberFile, requireCreatedMemberFile } from "./session-file"
import {
  type TeamCreatedMemberSession,
  type TeamMemberSessionDependencies,
  type TeamOpenedSession,
  type TeamRecordSource,
  type TeamSessionCreation,
} from "./types"

export class PiTeamMemberSessions implements MemberSessions {
  private readonly dependencies: TeamMemberSessionDependencies

  constructor(dependencies: TeamMemberSessionDependencies) {
    this.dependencies = dependencies
  }

  async open(request: OpenMemberRequest, team: AgentTeam): Promise<OpenedMember> {
    const context = this.dependencies.context()
    const selection = selectMemberModel(context, request)
    const leadId = context.sessionManager.getSessionId()
    const storage = createTeamMemberStorage(context.cwd, leadId)
    const opened = await this.openStored({ cwd: context.cwd, storage, selection, name: request.name, team })
    return {
      session: new PiTeamSessionAdapter(opened.session.session, opened.session.lifecycle),
      journal: new PiTeamMemberJournal(storage),
      record: this.record({ request, selection, storage, path: opened.path, leadId, cwd: context.cwd }),
    }
  }

  private async openStored(input: TeamSessionCreation): Promise<TeamOpenedSession> {
    const { storage } = input
    try {
      return await this.createValidated(input)
    } catch (error) {
      removeFailedMemberFile(storage)
      throw error
    }
  }

  private async createValidated(input: TeamSessionCreation): Promise<TeamOpenedSession> {
    const { storage } = input
    const session = await this.create(input)
    try {
      return { session, path: requireCreatedMemberFile(storage) }
    } catch (error) {
      await session.lifecycle.close()
      throw error
    }
  }

  async reopen(record: MemberRecord, team: AgentTeam): Promise<OpenedMember> {
    const context = this.dependencies.context()
    this.ensureRecordBelongsToContext(record, context)
    const selection = selectMemberModel(context, { model: record.model, thinking: record.thinking })
    const storage = openTeamMemberStorage(record)
    const session = await this.create({ cwd: record.cwd, storage, selection, name: record.name, team })
    return {
      session: new PiTeamSessionAdapter(session.session, session.lifecycle),
      journal: new PiTeamMemberJournal(storage),
      record,
    }
  }

  private ensureRecordBelongsToContext(record: MemberRecord, context: AgentTeamContext): void {
    if (record.leadId !== context.sessionManager.getSessionId() || record.cwd !== context.cwd) {
      throw new Error(TEAM_PI_MEMBER_WRONG_LEAD + record.name)
    }
  }

  private create(input: TeamSessionCreation): Promise<TeamCreatedMemberSession> {
    const { cwd, storage, selection, name, team } = input
    return createPiTeamMemberSession({
      cwd,
      storage,
      selection,
      instructions: `${TEAM_PI_MEMBER_IDENTITY_START}${name}${TEAM_PI_MEMBER_IDENTITY_END}`,
      tools: this.dependencies.tools(team, name),
      extension: this.dependencies.extension,
      extensionPaths: readMemberExtensions(getAgentDir()),
    })
  }

  private record(source: TeamRecordSource): MemberRecord {
    const { request, selection, storage, path, leadId, cwd } = source
    return {
      leadId,
      name: request.name,
      description: request.description,
      model: `${selection.model.provider}${REFERENCE_SEPARATOR}${selection.model.id}`,
      thinking: selection.thinkingLevel,
      cwd,
      sessionId: storage.getSessionId(),
      sessionFile: path,
    }
  }
}
