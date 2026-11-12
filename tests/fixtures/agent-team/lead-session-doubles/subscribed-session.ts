import { PiTeamSessionAdapter } from "#synapse/integration"
import { TeamSessionDouble } from "./session-double"

export function subscribedTeamSession(): TeamSessionDouble {
  const session = new TeamSessionDouble()
  const adapter = new PiTeamSessionAdapter(session)
  adapter.subscribe(session.collect.bind(session))
  return session
}
