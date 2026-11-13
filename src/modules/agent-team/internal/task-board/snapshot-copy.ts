import { type TaskSnapshot } from "#synapse/modules/agent-team/public/contracts"

export function taskBoardCopySnapshot(task: TaskSnapshot): TaskSnapshot {
  return { ...task, blockedBy: [...task.blockedBy], writeScopes: [...task.writeScopes] }
}
