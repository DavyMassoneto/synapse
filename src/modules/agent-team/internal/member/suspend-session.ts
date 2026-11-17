import { type MemberSession } from "#synapse/modules/agent-team/public/contracts"
import { type TeamMemberQueue } from "./member-queue"

export async function suspendMemberSession(
  session: MemberSession,
  queue: TeamMemberQueue,
  busy: boolean,
  run: Promise<void>,
): Promise<void> {
  try {
    queue.checkpoint(busy)
  } finally {
    try {
      await session.abort()
    } finally {
      await run
    }
  }
}
