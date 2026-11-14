import { fileURLToPath } from "node:url"
import { DefaultResourceLoader, type Extension } from "@earendil-works/pi-coding-agent"
import { ENTRIES_PATHS } from "./constants"

export async function entryPathsLoader(disabled?: number): Promise<DefaultResourceLoader> {
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
  })
  await loader.reload()
  return loader
}

export function entryToolCount(extension: Extension): number {
  return extension.tools.size
}
