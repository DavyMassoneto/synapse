import { fileURLToPath } from "node:url"

export const PROMPTS_DIR = fileURLToPath(new URL("../../prompts", import.meta.url))

export const PROMPT_FILES = ["method.md", "standards.md"]

export const FORMAT_FILE = "format.md"

export const CONTEXT_ROOTS = [
  "AGENTS.md",
  "docs/architecture.md",
  "docs/standards",
  "biome.json",
  "biome",
  "tsconfig.json",
]

export const CONTEXT_SUFFIXES = [".md", ".json", ".grit"]

export const LIST_TREE_ARGUMENTS = ["ls-tree", "-r", "--name-only"]

export const PATHSPEC_SEPARATOR = "--"

export const SHOW_ARGUMENT = "show"

export const BASE_REFERENCE_SEPARATOR = ":"

export const CONTEXT_HEADER = "# "
