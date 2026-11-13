import { TEAM_PI_TIME_LOCALE } from "./constants"

export function piTeamClock(): string {
  return new Date().toLocaleTimeString(TEAM_PI_TIME_LOCALE)
}
