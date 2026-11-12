import { existsSync } from "node:fs"
import { type SessionManager } from "@earendil-works/pi-coding-agent"
import { Value } from "typebox/value"
import { type MemberCheckpoint, type MemberJournal } from "#synapse/modules"
import {
  TEAM_PI_MEMBER_CHECKPOINT,
  TEAM_PI_MEMBER_CHECKPOINT_SCHEMA,
  TEAM_PI_MEMBER_CUSTOM_ENTRY,
  TEAM_PI_MEMBER_MISSING_SESSION,
  TEAM_PI_MEMBER_UNSET_SESSION,
} from "./constants"
import { isTeamMemberCheckpoint } from "./predicates"

export class PiTeamMemberJournal implements MemberJournal {
  private readonly storage: SessionManager

  constructor(storage: SessionManager) {
    this.storage = storage
  }

  load(): MemberCheckpoint {
    const entry = this.storage.getBranch().findLast(isTeamMemberCheckpoint)
    if (entry?.type === TEAM_PI_MEMBER_CUSTOM_ENTRY) {
      return Value.Parse(TEAM_PI_MEMBER_CHECKPOINT_SCHEMA, entry.data)
    }
    return { interrupted: false, pending: [] }
  }

  save(checkpoint: MemberCheckpoint): void {
    const path = this.storage.getSessionFile()
    if (!path) {
      throw new Error(TEAM_PI_MEMBER_UNSET_SESSION)
    }
    if (!existsSync(path)) {
      throw new Error(TEAM_PI_MEMBER_MISSING_SESSION + path)
    }
    this.storage.appendCustomEntry(TEAM_PI_MEMBER_CHECKPOINT, checkpoint)
  }
}
