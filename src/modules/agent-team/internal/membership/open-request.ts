import { type OpenMemberRequest, type StartMemberRequest } from "#synapse/modules/agent-team/public/contracts"

export function teamOpenRequest(name: string, request: StartMemberRequest): OpenMemberRequest {
  const open: OpenMemberRequest = { name, description: request.description }
  if (request.model) {
    open.model = request.model
  }
  if (request.thinking) {
    open.thinking = request.thinking
  }
  return open
}
