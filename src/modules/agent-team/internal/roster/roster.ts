import { type MemberRecord, TEAM_LEAD_NAME, type TeamAgentRow } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember } from "../member"
import { TeamRuleError } from "../operation-results"
import {
  TEAM_DEFAULT_NAME,
  TEAM_INVALID_NAME,
  TEAM_NAME_PATTERN,
  TEAM_NAME_TAKEN,
  TEAM_UNKNOWN_AGENT,
} from "./constants"
import { failedMemberRow } from "./failed-member-row"
import { type TeamFailedMembers, type TeamMembers } from "./types"

export class TeamRoster {
  private readonly members: TeamMembers = new Map()

  private readonly reserved = new Set<string>()

  private readonly failedMembers: TeamFailedMembers = new Map()

  private nextNumber = 1

  reserve(name: string): string {
    if (!TEAM_NAME_PATTERN.test(name) || name === TEAM_LEAD_NAME) {
      throw new TeamRuleError(`${TEAM_INVALID_NAME}${name}`)
    }
    if (this.isTaken(name)) {
      throw new TeamRuleError(`${TEAM_NAME_TAKEN}${name}`)
    }
    this.reserved.add(name)
    return name
  }

  reserveDefault(): string {
    let name = `${TEAM_DEFAULT_NAME}${this.nextNumber}`
    while (this.isTaken(name)) {
      this.nextNumber += 1
      name = `${TEAM_DEFAULT_NAME}${this.nextNumber}`
    }
    return this.reserve(name)
  }

  release(name: string): void {
    this.reserved.delete(name)
  }

  add(member: TeamMember): void {
    this.reserved.delete(member.name)
    this.members.set(member.name, member)
  }

  has(name: string): boolean {
    return this.members.has(name)
  }

  find(name: string): TeamMember {
    const member = this.members.get(name)
    if (member) {
      return member
    }
    const failure = this.failedMembers.get(name)
    if (failure) {
      throw new TeamRuleError(failure.message)
    }
    throw new TeamRuleError(`${TEAM_UNKNOWN_AGENT}${name}`)
  }

  failed(record: MemberRecord, message: string): void {
    this.reserved.delete(record.name)
    this.failedMembers.set(record.name, { record, message })
  }

  failures(): TeamAgentRow[] {
    return Array.from(this.failedMembers.values(), failedMemberRow)
  }

  all(): TeamMember[] {
    return Array.from(this.members.values())
  }

  clear(): TeamMember[] {
    const removed = this.all()
    this.members.clear()
    this.reserved.clear()
    this.failedMembers.clear()
    this.nextNumber = 1
    return removed
  }

  private isTaken(name: string): boolean {
    return this.members.has(name) || this.reserved.has(name) || this.failedMembers.has(name)
  }
}
