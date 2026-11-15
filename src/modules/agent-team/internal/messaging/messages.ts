import {
  TEAM_DONE,
  TEAM_INTERRUPT_REQUESTED,
  TEAM_LEAD_NAME,
  type TeamInterruptOutcome,
  type TeamLead,
  type TeamOutcome,
} from "#synapse/modules/agent-team/public/contracts"
import { TeamRuleError, teamOperationResult } from "../operation-results"
import { type TeamRecentEvents } from "../recent-events"
import { TEAM_UNKNOWN_AGENT, type TeamRoster } from "../roster"
import {
  TEAM_CLOSED,
  TEAM_EVENT_ARROW,
  TEAM_EVENT_DETAIL,
  TEAM_MESSAGE_FROM,
  TEAM_MESSAGE_FROM_END,
  TEAM_SELF_MESSAGE,
} from "./constants"
import { type TeamRefreshPort } from "./types"

export class TeamMessages {
  private readonly lead: TeamLead

  private readonly roster: TeamRoster

  private readonly events: TeamRecentEvents

  private readonly view: TeamRefreshPort

  private closed = false

  constructor(lead: TeamLead, roster: TeamRoster, events: TeamRecentEvents, view: TeamRefreshPort) {
    this.lead = lead
    this.roster = roster
    this.events = events
    this.view = view
  }

  close(): void {
    this.closed = true
  }

  reopen(): void {
    this.closed = false
  }

  send(sender: string, target: string, message: string): TeamOutcome {
    return teamOperationResult(this.deliverMessage.bind(this, sender, target, message))
  }

  interrupt(target: string): TeamInterruptOutcome {
    return teamOperationResult(this.interruptMember.bind(this, target))
  }

  private deliverMessage(sender: string, target: string, message: string): TeamOutcome {
    this.ensureCanSend(sender, target)
    this.route(sender, target, message)
    this.events.add(`${sender}${TEAM_EVENT_ARROW}${target}${TEAM_EVENT_DETAIL}${message}`)
    this.view.refresh()
    return { kind: TEAM_DONE }
  }

  private route(sender: string, target: string, message: string): void {
    const text = `${TEAM_MESSAGE_FROM}${sender}${TEAM_MESSAGE_FROM_END}${message}`
    if (target === TEAM_LEAD_NAME) {
      this.deliverLead(text)
    } else {
      this.roster.find(target).deliver(text)
    }
  }

  private interruptMember(target: string): TeamInterruptOutcome {
    if (this.closed) {
      throw new TeamRuleError(TEAM_CLOSED)
    }
    this.roster.find(target).interrupt()
    return { kind: TEAM_INTERRUPT_REQUESTED }
  }

  private ensureCanSend(sender: string, target: string): void {
    if (this.closed) {
      throw new TeamRuleError(TEAM_CLOSED)
    }
    if (sender !== TEAM_LEAD_NAME && !this.roster.has(sender)) {
      throw new TeamRuleError(`${TEAM_UNKNOWN_AGENT}${sender}`)
    }
    if (sender === target) {
      throw new TeamRuleError(TEAM_SELF_MESSAGE)
    }
  }

  deliverLead(text: string): void {
    if (!this.closed) {
      this.lead.deliver(text)
    }
  }
}
