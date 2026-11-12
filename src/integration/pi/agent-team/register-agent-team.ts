import {
  TEAM_PI_AGENT_SETTLED,
  TEAM_PI_BEFORE_AGENT_START,
  TEAM_PI_MESSAGE_END,
  TEAM_PI_SESSION_SHUTDOWN,
  TEAM_PI_SESSION_START,
  TEAM_PI_TURN_START,
} from "./constants"
import { createPiTeamLeadSession } from "./lead-session"
import { PiTeamLifecycle } from "./lifecycle"
import { PiTeamMemberSessions } from "./member-sessions"
import { piTeamClock } from "./team-clock"
import { leadTools, memberTools } from "./tools"
import { type AgentTeamHost, type AgentTeamMemberExtension, type AgentTeamMount } from "./types"

export function registerAgentTeam(
  pi: AgentTeamHost,
  mount: AgentTeamMount,
  memberExtension: AgentTeamMemberExtension,
): void {
  const lead = createPiTeamLeadSession(pi)
  const sessions = new PiTeamMemberSessions({
    context: lead.context.bind(lead),
    extension: memberExtension,
    tools: memberTools,
  })
  const team = mount(lead, sessions, piTeamClock)
  const lifecycle = new PiTeamLifecycle(lead, team)
  for (const tool of leadTools(team)) {
    pi.registerTool(tool)
  }
  pi.on(TEAM_PI_SESSION_START, lifecycle.sessionStart.bind(lifecycle))
  pi.on(TEAM_PI_SESSION_SHUTDOWN, lifecycle.sessionShutdown.bind(lifecycle))
  pi.on(TEAM_PI_BEFORE_AGENT_START, lifecycle.beforeAgentStart.bind(lifecycle))
  pi.on(TEAM_PI_TURN_START, lifecycle.turnStart.bind(lifecycle))
  pi.on(TEAM_PI_MESSAGE_END, lifecycle.messageEnd.bind(lifecycle))
  pi.on(TEAM_PI_AGENT_SETTLED, lifecycle.agentSettled.bind(lifecycle))
}
