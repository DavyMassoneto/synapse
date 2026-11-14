import { fileURLToPath } from "node:url"
import {
  DefaultResourceLoader,
  type Extension,
  type ExtensionAPI,
  type ExtensionFactory,
} from "@earendil-works/pi-coding-agent"
import { composeResponseRules, selectMemberFactories } from "#synapse/composition"
import {
  CAPABILITY_ROUTER_PRESENT,
  CAPABILITY_ROUTER_PROBE,
  CapabilityPresence,
  type CapabilityPresenceHost,
  createPiTeamLeadSession,
  memberTools,
  PiTeamMemberSessions,
} from "#synapse/integration"
import { type AgentTeam, type OpenedMember } from "#synapse/modules"
import { TeamLeadContext, TeamLeadHost } from "../agent-team"
import { SynapseHostCollector } from "../composition"
import { fixtureModel } from "../context"
import {
  ENTRIES_FAILURE,
  ENTRIES_MEMBER_CONTEXT_WINDOW,
  ENTRIES_MEMBER_MODEL,
  ENTRIES_MEMBER_NAME,
  ENTRIES_MEMBER_PROVIDER,
  ENTRIES_MEMBER_VIRTUAL_REFERENCE,
  ENTRIES_PATHS,
  ENTRIES_RULES_PATH,
} from "./constants"

export async function openMemberWithoutRouter(host: CapabilityPresenceHost, team: AgentTeam): Promise<OpenedMember> {
  const lead = createPiTeamLeadSession(new TeamLeadHost())
  lead.attach(
    new TeamLeadContext(fixtureModel(ENTRIES_MEMBER_PROVIDER, ENTRIES_MEMBER_MODEL, ENTRIES_MEMBER_CONTEXT_WINDOW)),
  )
  const sessions = new PiTeamMemberSessions({
    context: lead.context.bind(lead),
    extensions: selectMemberFactories.bind(undefined, host),
    tools: memberTools,
  })
  return sessions.open(
    { name: ENTRIES_MEMBER_NAME, description: ENTRIES_MEMBER_NAME, model: ENTRIES_MEMBER_VIRTUAL_REFERENCE },
    team,
  )
}

export function failAfterPresence(pi: ExtensionAPI): never {
  const presence = new CapabilityPresence(pi, CAPABILITY_ROUTER_PRESENT)
  pi.events.on(CAPABILITY_ROUTER_PROBE, presence.answer.bind(presence))
  throw new Error(ENTRIES_FAILURE)
}

export async function failedPresenceLoader(host: CapabilityPresenceHost): Promise<DefaultResourceLoader> {
  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: process.cwd(),
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    eventBus: host.events,
    extensionFactories: [failAfterPresence],
  })
  await loader.reload()
  return loader
}

export async function explicitRulesLoader(): Promise<DefaultResourceLoader> {
  const paths = [fileURLToPath(new URL(ENTRIES_RULES_PATH, import.meta.url))]
  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: process.cwd(),
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    additionalExtensionPaths: paths,
  })
  await loader.reload()
  return loader
}

export async function entryPathsLoader(
  disabled?: number,
  host?: CapabilityPresenceHost,
): Promise<DefaultResourceLoader> {
  const paths: string[] = []
  for (const [position, path] of ENTRIES_PATHS.entries()) {
    if (position !== disabled) {
      paths.push(fileURLToPath(new URL(path, import.meta.url)))
    }
  }
  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: process.cwd(),
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    additionalExtensionPaths: paths,
    ...(host ? { eventBus: host.events } : {}),
  })
  await loader.reload()
  return loader
}

export async function explicitAndInheritedRulesLoader(): Promise<DefaultResourceLoader> {
  const paths = [fileURLToPath(new URL(ENTRIES_RULES_PATH, import.meta.url))]
  const lead = new SynapseHostCollector()
  composeResponseRules(lead)
  const factories: ExtensionFactory[] = selectMemberFactories(lead)
  const loader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: process.cwd(),
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    additionalExtensionPaths: paths,
    extensionFactories: factories,
  })
  await loader.reload()
  return loader
}

export function entryToolCount(extension: Extension): number {
  return extension.tools.size
}
