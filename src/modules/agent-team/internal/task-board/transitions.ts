import {
  TASK_CLAIM,
  TASK_COMPLETE,
  TASK_COMPLETED,
  TASK_DELETE,
  TASK_DELETED,
  TASK_EDIT,
  TASK_IN_PROGRESS,
  TASK_PENDING,
  TASK_REASSIGN,
  TASK_RELEASE,
  TASK_REOPEN,
  TASK_SET_DEPENDENCIES,
  type TaskSnapshot,
  type TaskStatus,
} from "#synapse/modules/agent-team/public/contracts"
import { taskBoardEnsureAcyclic, taskBoardResolveBlockers } from "./blockers"
import {
  TASK_BOARD_ALREADY_CLAIMED,
  TASK_BOARD_BLOCKED,
  TASK_BOARD_DEPENDENCIES_REQUIRED,
  TASK_BOARD_EDIT_WITHOUT_FIELDS,
  TASK_BOARD_EMPTY_TEXT,
  TASK_BOARD_HAS_DEPENDENTS,
  TASK_BOARD_LEAD_REQUIRED,
  TASK_BOARD_MAX_DESCRIPTION_LENGTH,
  TASK_BOARD_MAX_SUBJECT_LENGTH,
  TASK_BOARD_NOT_COMPLETED,
  TASK_BOARD_NOT_IN_PROGRESS,
  TASK_BOARD_NOT_READY,
  TASK_BOARD_NOT_REASSIGNABLE,
  TASK_BOARD_UNAUTHORIZED,
  TASK_BOARD_UNKNOWN_ACTION,
  TASK_BOARD_UNKNOWN_OWNER,
} from "./constants"
import { isTaskBoardActive, isTaskBoardTaskReady } from "./predicates"
import { TaskRefusal } from "./task-refusal"
import { taskBoardStatuses } from "./task-status"
import { taskBoardRequireText } from "./task-text"
import { type TaskTransition } from "./types"
import { taskBoardNormalizeScopes } from "./write-scope"

function withoutOwner(task: TaskSnapshot, status: TaskStatus): TaskSnapshot {
  return {
    id: task.id,
    revision: task.revision,
    subject: task.subject,
    description: task.description,
    status,
    blockedBy: task.blockedBy,
    writeScopes: task.writeScopes,
  }
}

function ensureOwnerOrLead(transition: TaskTransition): void {
  if (transition.current.owner !== transition.caller && !transition.directory.isLead(transition.caller)) {
    throw new TaskRefusal(TASK_BOARD_UNAUTHORIZED)
  }
}

function ensureStatus(task: TaskSnapshot, status: TaskStatus, failure: string): void {
  if (task.status !== status) {
    throw new TaskRefusal(failure)
  }
}

function claim(transition: TaskTransition): TaskSnapshot {
  const { current, caller, tasks } = transition
  if (current.owner && current.owner !== caller) {
    throw new TaskRefusal(`${TASK_BOARD_ALREADY_CLAIMED}${current.owner}`)
  }
  if (current.status !== TASK_PENDING || !isTaskBoardTaskReady(taskBoardStatuses(tasks), current)) {
    throw new TaskRefusal(TASK_BOARD_NOT_READY)
  }
  return { ...current, status: TASK_IN_PROGRESS, owner: caller }
}

function release(transition: TaskTransition): TaskSnapshot {
  ensureOwnerOrLead(transition)
  ensureStatus(transition.current, TASK_IN_PROGRESS, TASK_BOARD_NOT_IN_PROGRESS)
  return withoutOwner(transition.current, TASK_PENDING)
}

function edit(transition: TaskTransition): TaskSnapshot {
  const { current, input } = transition
  ensureOwnerOrLead(transition)
  if (input.subject === "" || input.description === "") {
    throw new TaskRefusal(TASK_BOARD_EMPTY_TEXT)
  }
  if (!input.subject && !input.description && !input.writeScopes) {
    throw new TaskRefusal(TASK_BOARD_EDIT_WITHOUT_FIELDS)
  }
  const next = { ...current }
  if (input.subject) {
    next.subject = taskBoardRequireText(input.subject, TASK_BOARD_MAX_SUBJECT_LENGTH)
  }
  if (input.description) {
    next.description = taskBoardRequireText(input.description, TASK_BOARD_MAX_DESCRIPTION_LENGTH)
  }
  if (input.writeScopes) {
    next.writeScopes = taskBoardNormalizeScopes(input.writeScopes)
  }
  return next
}

function setDependencies(transition: TaskTransition): TaskSnapshot {
  const { current, input, tasks } = transition
  ensureOwnerOrLead(transition)
  if (!input.blockedBy) {
    throw new TaskRefusal(TASK_BOARD_DEPENDENCIES_REQUIRED)
  }
  const blockers = taskBoardResolveBlockers(tasks, input.blockedBy, current.id)
  taskBoardEnsureAcyclic(tasks, current.id, blockers)
  return { ...current, blockedBy: blockers }
}

function complete(transition: TaskTransition): TaskSnapshot {
  ensureOwnerOrLead(transition)
  ensureStatus(transition.current, TASK_IN_PROGRESS, TASK_BOARD_NOT_IN_PROGRESS)
  return { ...transition.current, status: TASK_COMPLETED }
}

function reopen(transition: TaskTransition): TaskSnapshot {
  ensureOwnerOrLead(transition)
  ensureStatus(transition.current, TASK_COMPLETED, TASK_BOARD_NOT_COMPLETED)
  return withoutOwner(transition.current, TASK_PENDING)
}

function assignTo(transition: TaskTransition, owner: string): TaskSnapshot {
  const { current, directory, tasks } = transition
  if (!isTaskBoardTaskReady(taskBoardStatuses(tasks), current)) {
    throw new TaskRefusal(TASK_BOARD_BLOCKED)
  }
  if (!directory.hasAgent(owner)) {
    throw new TaskRefusal(`${TASK_BOARD_UNKNOWN_OWNER}${owner}`)
  }
  return { ...current, status: TASK_IN_PROGRESS, owner }
}

function reassign(transition: TaskTransition): TaskSnapshot {
  const { current, caller, directory, input } = transition
  if (!directory.isLead(caller)) {
    throw new TaskRefusal(TASK_BOARD_LEAD_REQUIRED)
  }
  if (current.status !== TASK_PENDING && current.status !== TASK_IN_PROGRESS) {
    throw new TaskRefusal(TASK_BOARD_NOT_REASSIGNABLE)
  }
  if (input.owner) {
    return assignTo(transition, input.owner)
  }
  return withoutOwner(current, TASK_PENDING)
}

function remove(transition: TaskTransition): TaskSnapshot {
  const { current, tasks } = transition
  ensureOwnerOrLead(transition)
  const dependent = tasks.find((task) => isTaskBoardActive(task) && task.blockedBy.includes(current.id))
  if (dependent) {
    throw new TaskRefusal(`${TASK_BOARD_HAS_DEPENDENTS}${dependent.id}`)
  }
  return { ...current, status: TASK_DELETED }
}

export function taskBoardApplyAction(transition: TaskTransition): TaskSnapshot {
  switch (transition.input.action) {
    case TASK_CLAIM:
      return claim(transition)
    case TASK_RELEASE:
      return release(transition)
    case TASK_EDIT:
      return edit(transition)
    case TASK_SET_DEPENDENCIES:
      return setDependencies(transition)
    case TASK_COMPLETE:
      return complete(transition)
    case TASK_REOPEN:
      return reopen(transition)
    case TASK_REASSIGN:
      return reassign(transition)
    case TASK_DELETE:
      return remove(transition)
    default:
      throw new TaskRefusal(`${TASK_BOARD_UNKNOWN_ACTION}${transition.input.action}`)
  }
}
