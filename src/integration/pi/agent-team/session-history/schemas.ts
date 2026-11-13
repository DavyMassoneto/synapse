import { Type } from "typebox"
import { TASK_COMPLETED, TASK_DELETED, TASK_IN_PROGRESS, TASK_PENDING } from "#synapse/modules"

export const TeamHistoryTaskSchema = Type.Object({
  id: Type.String(),
  revision: Type.Integer({ minimum: 1 }),
  subject: Type.String(),
  description: Type.String(),
  status: Type.Union([
    Type.Literal(TASK_PENDING),
    Type.Literal(TASK_IN_PROGRESS),
    Type.Literal(TASK_COMPLETED),
    Type.Literal(TASK_DELETED),
  ]),
  owner: Type.Optional(Type.String()),
  blockedBy: Type.Array(Type.String()),
  writeScopes: Type.Array(Type.String()),
})

export const TeamHistoryMemberSchema = Type.Object({
  leadId: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  model: Type.String({ minLength: 1 }),
  thinking: Type.String({ minLength: 1 }),
  cwd: Type.String({ minLength: 1 }),
  sessionId: Type.String({ minLength: 1 }),
  sessionFile: Type.String({ minLength: 1 }),
})
