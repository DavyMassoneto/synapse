import { MAX_OUTPUT_TOKENS } from "#evaluator/provider-client"

export const TEMPLATE_FILE = "docs/pr-evaluator.md"

export const ARCHITECTURE_FILE = "docs/architecture.md"

export const RULES_FILE = "AGENTS.md"

export const STANDARDS_DIRECTORY = "docs/standards"

export const MARKDOWN_EXTENSION = ".md"

export const STANDARD_BREAK = "\n\n"

export const TEMPLATE_PATTERN = /```text\n([\s\S]*?)\n```/

export const PLACEHOLDER_ARCHITECTURE = "{{ARQUITETURA}}"

export const PLACEHOLDER_RULES = "{{REGRAS}}"

export const PLACEHOLDER_STANDARDS = "{{PADROES}}"

export const PLACEHOLDER_DIFF = "{{DIFF}}"

export const PLACEHOLDER_PATTERN = /\{\{[A-Z]+\}\}/g

export const MODEL_CONTEXT_TOKENS = 1_000_000

export const CONSERVATIVE_CHARACTERS_PER_TOKEN = 1

export const MAX_PROMPT_CHARACTERS = (MODEL_CONTEXT_TOKENS - MAX_OUTPUT_TOKENS) * CONSERVATIVE_CHARACTERS_PER_TOKEN
