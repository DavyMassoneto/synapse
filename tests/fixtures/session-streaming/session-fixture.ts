import { appendFileSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { TEAM_PI_MEMBER_CHECKPOINT } from "#synapse/integration/pi/agent-team"
import { type MemberRecord } from "#synapse/modules/agent-team"
import {
  STREAM_SESSION_ABANDONED_STATE,
  STREAM_SESSION_ACTIVE_CHECKPOINT,
  STREAM_SESSION_ACTIVE_STATE,
  STREAM_SESSION_BYTES,
  STREAM_SESSION_CUSTOM_TYPE,
  STREAM_SESSION_FILE,
  STREAM_SESSION_FILLER_TYPE,
  STREAM_SESSION_HEADER_TYPE,
  STREAM_SESSION_ID,
  STREAM_SESSION_LEAF,
  STREAM_SESSION_MESSAGE_TYPE,
  STREAM_SESSION_MODEL,
  STREAM_SESSION_MODEL_TYPE,
  STREAM_SESSION_NEWLINE,
  STREAM_SESSION_PAYLOAD,
  STREAM_SESSION_PREFIX,
  STREAM_SESSION_PROVIDER,
  STREAM_SESSION_ROOT,
  STREAM_SESSION_THINKING,
  STREAM_SESSION_THINKING_TYPE,
  STREAM_SESSION_TIMESTAMP,
  STREAM_SESSION_USER_ROLE,
  STREAM_SESSION_VERSION,
} from "./constants"

export class StreamingSessionFixture {
  readonly directory = mkdtempSync(join(tmpdir(), STREAM_SESSION_PREFIX))
  readonly path = join(this.directory, STREAM_SESSION_FILE)
  readonly record: MemberRecord = {
    leadId: STREAM_SESSION_ID,
    name: STREAM_SESSION_ID,
    description: STREAM_SESSION_ID,
    model: `${STREAM_SESSION_PROVIDER}/${STREAM_SESSION_MODEL}`,
    thinking: STREAM_SESSION_THINKING,
    cwd: this.directory,
    sessionId: STREAM_SESSION_ID,
    sessionFile: this.path,
  }

  header(): string {
    return JSON.stringify({
      type: STREAM_SESSION_HEADER_TYPE,
      version: STREAM_SESSION_VERSION,
      id: STREAM_SESSION_ID,
      cwd: this.directory,
      timestamp: STREAM_SESSION_TIMESTAMP,
    })
  }

  writeLargeSession(): void {
    writeFileSync(this.path, this.header() + STREAM_SESSION_NEWLINE)
    appendFileSync(
      this.path,
      JSON.stringify({
        type: STREAM_SESSION_MESSAGE_TYPE,
        id: STREAM_SESSION_ROOT,
        parentId: null,
        timestamp: STREAM_SESSION_TIMESTAMP,
        message: { role: STREAM_SESSION_USER_ROLE, content: STREAM_SESSION_PAYLOAD, timestamp: 0 },
      }) + STREAM_SESSION_NEWLINE,
    )
    let bytes = statSync(this.path).size
    let sequence = 0
    while (bytes < STREAM_SESSION_BYTES) {
      const line =
        JSON.stringify({
          type: STREAM_SESSION_CUSTOM_TYPE,
          id: String(sequence),
          parentId: STREAM_SESSION_ROOT,
          timestamp: STREAM_SESSION_TIMESTAMP,
          customType: STREAM_SESSION_FILLER_TYPE,
          data: STREAM_SESSION_PAYLOAD,
        }) + STREAM_SESSION_NEWLINE
      appendFileSync(this.path, line)
      bytes += Buffer.byteLength(line)
      sequence++
    }
    this.writeBranch()
  }

  dispose(): void {
    rmSync(this.directory, { recursive: true, force: true })
  }

  private writeBranch(): void {
    const entries = [
      {
        type: STREAM_SESSION_CUSTOM_TYPE,
        id: STREAM_SESSION_ACTIVE_CHECKPOINT,
        parentId: STREAM_SESSION_ROOT,
        timestamp: STREAM_SESSION_TIMESTAMP,
        customType: TEAM_PI_MEMBER_CHECKPOINT,
        data: STREAM_SESSION_ACTIVE_STATE,
      },
      {
        type: STREAM_SESSION_CUSTOM_TYPE,
        id: STREAM_SESSION_CUSTOM_TYPE,
        parentId: STREAM_SESSION_ROOT,
        timestamp: STREAM_SESSION_TIMESTAMP,
        customType: TEAM_PI_MEMBER_CHECKPOINT,
        data: STREAM_SESSION_ABANDONED_STATE,
      },
      {
        type: STREAM_SESSION_MODEL_TYPE,
        id: STREAM_SESSION_MODEL,
        parentId: STREAM_SESSION_ACTIVE_CHECKPOINT,
        timestamp: STREAM_SESSION_TIMESTAMP,
        provider: STREAM_SESSION_PROVIDER,
        modelId: STREAM_SESSION_MODEL,
      },
      {
        type: STREAM_SESSION_THINKING_TYPE,
        id: STREAM_SESSION_LEAF,
        parentId: STREAM_SESSION_MODEL,
        timestamp: STREAM_SESSION_TIMESTAMP,
        thinkingLevel: STREAM_SESSION_THINKING,
      },
    ]
    for (const entry of entries) {
      appendFileSync(this.path, JSON.stringify(entry) + STREAM_SESSION_NEWLINE)
    }
  }
}
