import { type SessionEntry } from "@earendil-works/pi-coding-agent"
import { TEAM_PI_MEMBER_CHECKPOINT, TEAM_PI_MEMBER_CUSTOM_ENTRY } from "./constants"

export function isTeamMemberCheckpoint(entry: SessionEntry): boolean {
  return entry.type === TEAM_PI_MEMBER_CUSTOM_ENTRY && entry.customType === TEAM_PI_MEMBER_CHECKPOINT
}
