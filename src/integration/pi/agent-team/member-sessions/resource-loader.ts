import { DefaultResourceLoader } from "@earendil-works/pi-coding-agent"
import { TEAM_PI_MEMBER_EXTENSION_FAILURE } from "../extension-lifecycle"
import { updateSupervisedBashTool } from "../supervised-bash"
import { readCanonicalMemberExclusions } from "./read-exclusions"
import { resolveMemberResources } from "./resolve-resources"
import { selectMemberExtensionPaths } from "./select-paths"
import { type TeamMemberResourceRequest } from "./types"

export class TeamMemberResourceLoader extends DefaultResourceLoader {
  private readonly paths: string[]
  private readonly request: TeamMemberResourceRequest

  constructor(request: TeamMemberResourceRequest) {
    const paths: string[] = []
    super({
      cwd: request.cwd,
      agentDir: request.agentDirectory,
      settingsManager: request.settings,
      noExtensions: true,
      additionalExtensionPaths: paths,
      appendSystemPrompt: [request.instructions],
      extensionFactories: request.taskContext ? [request.taskContext] : [],
    })
    this.paths = paths
    this.request = request
  }

  async reload(): Promise<void> {
    const excluded = readCanonicalMemberExclusions(this.request.agentDirectory)
    const resources = await resolveMemberResources(this.request)
    const paths = selectMemberExtensionPaths(resources, excluded)
    this.getExtensions().runtime.invalidate()
    this.paths.splice(0, this.paths.length, ...paths)
    await super.reload()
    updateSupervisedBashTool(this.request, this.getExtensions())
    const errors = this.getExtensions().errors
    if (errors.length > 0) {
      this.getExtensions().runtime.invalidate()
      throw new Error(TEAM_PI_MEMBER_EXTENSION_FAILURE + JSON.stringify(errors))
    }
  }
}
