import { type UpdateTaskInput } from "#synapse/modules"
import { TEAM_TOOL_DESCRIPTION_FIELD, TEAM_TOOL_OWNER_FIELD, TEAM_TOOL_SUBJECT_FIELD } from "./constants"
import { type TeamUpdateTaskInput } from "./types"

export function translateTeamTaskUpdate(input: TeamUpdateTaskInput): UpdateTaskInput {
  const request: UpdateTaskInput = {
    taskId: input.task_id,
    expectedRevision: input.expected_revision,
    action: input.action,
  }
  if (TEAM_TOOL_SUBJECT_FIELD in input) {
    request.subject = input.subject
  }
  if (TEAM_TOOL_DESCRIPTION_FIELD in input) {
    request.description = input.description
  }
  if (input.blocked_by) {
    request.blockedBy = input.blocked_by
  }
  if (input.write_scopes) {
    request.writeScopes = input.write_scopes
  }
  if (TEAM_TOOL_OWNER_FIELD in input) {
    request.owner = input.owner
  }
  return request
}
