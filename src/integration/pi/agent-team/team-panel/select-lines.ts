import {
  TASK_IN_PROGRESS,
  TASK_PENDING,
  type TaskView,
  TEAM_WAITING,
  TEAM_WORKING,
  type TeamAgentRow,
} from "#synapse/modules"
import {
  TEAM_PANEL_DESCRIPTION_SEPARATOR,
  TEAM_PANEL_EVENT,
  TEAM_PANEL_EVENTS_TITLE,
  TEAM_PANEL_INDENT,
  TEAM_PANEL_MAX_AGENTS,
  TEAM_PANEL_MAX_EVENTS,
  TEAM_PANEL_MAX_TASKS,
  TEAM_PANEL_ROW,
  TEAM_PANEL_SEPARATOR,
  TEAM_PANEL_STATE_LABELS,
  TEAM_PANEL_TITLE,
} from "./constants"
import { panelLine } from "./line-format"
import { type TeamPanelLine } from "./types"

function agentLine(agent: TeamAgentRow): TeamPanelLine {
  const parts = [agent.name, TEAM_PANEL_STATE_LABELS[agent.state]]
  if (agent.model) {
    parts.push(agent.model)
  }
  if (agent.effectiveModel && agent.effectiveModel !== agent.model) {
    parts.push(agent.effectiveModel)
  }
  if (agent.activity && agent.state !== TEAM_WAITING) {
    parts.push(agent.activity)
  }
  return panelLine(
    TEAM_PANEL_ROW,
    `${TEAM_PANEL_INDENT}${parts.join(TEAM_PANEL_SEPARATOR)}${TEAM_PANEL_DESCRIPTION_SEPARATOR}${agent.description}`,
  )
}

function taskLine(task: TaskView): TeamPanelLine {
  return panelLine(TEAM_PANEL_ROW, `${TEAM_PANEL_INDENT}${task.id}${TEAM_PANEL_SEPARATOR}${task.subject}`)
}

export function selectAgentLines(agents: TeamAgentRow[]): TeamPanelLine[] {
  const active: TeamPanelLine[] = []
  const settled: TeamPanelLine[] = []
  for (const agent of agents) {
    if (agent.state === TEAM_WORKING || agent.state === TEAM_WAITING) {
      if (active.length < TEAM_PANEL_MAX_AGENTS) {
        active.push(agentLine(agent))
      }
    } else if (settled.length < TEAM_PANEL_MAX_AGENTS) {
      settled.push(agentLine(agent))
    }
  }
  return active.concat(settled.slice(0, TEAM_PANEL_MAX_AGENTS - active.length))
}

export function selectTaskLines(tasks: TaskView[]): TeamPanelLine[] {
  const working: TeamPanelLine[] = []
  const pending: TeamPanelLine[] = []
  for (const task of tasks) {
    if (task.status === TASK_IN_PROGRESS && working.length < TEAM_PANEL_MAX_TASKS) {
      working.push(taskLine(task))
    } else if (task.status === TASK_PENDING && pending.length < TEAM_PANEL_MAX_TASKS) {
      pending.push(taskLine(task))
    }
  }
  return working.concat(pending.slice(0, TEAM_PANEL_MAX_TASKS - working.length))
}

export function selectEventLines(events: string[]): TeamPanelLine[] {
  const lines: TeamPanelLine[] = []
  if (events.length) {
    lines.push(panelLine(TEAM_PANEL_TITLE, TEAM_PANEL_EVENTS_TITLE))
    for (const event of events.slice(-TEAM_PANEL_MAX_EVENTS)) {
      lines.push(panelLine(TEAM_PANEL_EVENT, `${TEAM_PANEL_INDENT}${event}`))
    }
  }
  return lines
}
