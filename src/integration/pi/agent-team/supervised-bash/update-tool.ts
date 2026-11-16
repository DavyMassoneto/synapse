import { createBashToolDefinition, defineTool, type LoadExtensionsResult } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team"
import { SUPERVISED_BASH_TOOL_NAME } from "./constants"
import { SupervisedBashOperations } from "./operations"
import {
  type SupervisedBashMountRequest,
  type SupervisedBashToolIndex,
  type SupervisedBashToolList,
  type SupervisedBashToolOptions,
} from "./types"

export function updateSupervisedBashTool(request: SupervisedBashMountRequest, loaded: LoadExtensionsResult): void {
  const tools = request.tools
  const shell = request.shell
  if (tools && shell) {
    const registered = indexWithoutSupervisedBash(tools)
    const mounted = selectSupervisedBash(request, loaded, registered, shell)
    tools.splice(0, tools.length, ...mounted)
  }
}

function selectSupervisedBash(
  request: SupervisedBashMountRequest,
  loaded: LoadExtensionsResult,
  registered: SupervisedBashToolIndex,
  shell: SupervisedShellService,
): SupervisedBashToolList {
  for (const extension of loaded.extensions) {
    if (extension.tools.has(SUPERVISED_BASH_TOOL_NAME)) {
      return Array.from(registered.values())
    }
  }
  return [...registered.values(), buildSupervisedBashDefinition(request, shell)]
}

function buildSupervisedBashDefinition(request: SupervisedBashMountRequest, shell: SupervisedShellService) {
  const options: SupervisedBashToolOptions = {
    operations: new SupervisedBashOperations(shell, request.settings.getShellPath()),
  }
  const prefix = request.settings.getShellCommandPrefix()
  if (prefix) {
    options.commandPrefix = prefix
  }
  return defineTool({ ...createBashToolDefinition(request.cwd, options), defaultActive: false })
}

function indexWithoutSupervisedBash(tools: SupervisedBashToolList): SupervisedBashToolIndex {
  const registered: SupervisedBashToolIndex = new Map()
  for (const tool of tools) {
    registered.set(tool.name, tool)
  }
  registered.delete(SUPERVISED_BASH_TOOL_NAME)
  return registered
}
