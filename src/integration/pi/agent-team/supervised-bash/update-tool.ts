import { createBashToolDefinition, defineTool, type LoadExtensionsResult } from "@earendil-works/pi-coding-agent"
import { type SupervisedShellService } from "#synapse/modules/agent-team/public/supervised-shell"
import { SUPERVISED_BASH_TOOL_NAME } from "./constants"
import { SupervisedBashOperations } from "./operations"
import { type SupervisedBashMountRequest, type SupervisedBashToolList, type SupervisedBashToolOptions } from "./types"

export function updateSupervisedBashTool(request: SupervisedBashMountRequest, loaded: LoadExtensionsResult): void {
  const tools = request.tools
  const shell = request.shell
  if (tools && shell) {
    let overridden = false
    for (const extension of loaded.extensions) {
      if (extension.tools.has(SUPERVISED_BASH_TOOL_NAME)) {
        overridden = true
      }
    }
    const registered = new Map<string, SupervisedBashToolList[number]>()
    for (const tool of tools) {
      registered.set(tool.name, tool)
    }
    registered.delete(SUPERVISED_BASH_TOOL_NAME)
    tools.splice(0, tools.length, ...registered.values())
    if (!overridden) {
      appendSupervisedBash(request, tools, shell)
    }
  }
}

function appendSupervisedBash(
  request: SupervisedBashMountRequest,
  tools: SupervisedBashToolList,
  shell: SupervisedShellService,
): void {
  const options: SupervisedBashToolOptions = {
    operations: new SupervisedBashOperations(shell, request.settings.getShellPath()),
  }
  const prefix = request.settings.getShellCommandPrefix()
  if (prefix) {
    options.commandPrefix = prefix
  }
  tools.push(defineTool({ ...createBashToolDefinition(request.cwd, options), defaultActive: false }))
}
