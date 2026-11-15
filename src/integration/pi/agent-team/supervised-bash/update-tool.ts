import { createBashToolDefinition, defineTool, type LoadExtensionsResult } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
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
    const registered: SupervisedBashToolIndex = new Map()
    for (const tool of tools) {
      registered.set(tool.name, tool)
    }
    registered.delete(SUPERVISED_BASH_TOOL_NAME)
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
  const options: SupervisedBashToolOptions = {
    operations: new SupervisedBashOperations(shell, request.settings.getShellPath()),
  }
  const prefix = request.settings.getShellCommandPrefix()
  if (prefix) {
    options.commandPrefix = prefix
  }
  return [
    ...registered.values(),
    defineTool({ ...createBashToolDefinition(request.cwd, options), defaultActive: false }),
  ]
}
