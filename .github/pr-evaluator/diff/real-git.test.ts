import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { annotateDiff } from "./annotate-diff"
import { GIT_DIFF_ARGUMENTS } from "./constants"
import { hasDiffLine } from "./predicates"

const NAMES = ['we"ird.ts', "tab\there.ts", "bell\u0007.ts", "back\\slash.ts", "with space.ts", "acentuação.ts"]

function git(directory: string, args: string[]): string {
  return execFileSync("git", ["-c", "user.name=teste", "-c", "user.email=teste@example.com", ...args], {
    cwd: directory,
    encoding: "utf8",
  })
}

function commitAll(directory: string, content: string, message: string): void {
  for (const name of NAMES) {
    writeFileSync(join(directory, name), content)
  }
  git(directory, ["add", "-A"])
  git(directory, ["commit", "-q", "-m", message])
}

test("a saída real do git para nomes especiais é mapeada para o caminho verdadeiro", () => {
  const directory = mkdtempSync(join(tmpdir(), "evaluator-git-"))
  try {
    git(directory, ["init", "-q"])
    commitAll(directory, "um\n", "base")
    commitAll(directory, "dois\n", "alteração")
    const { lines } = annotateDiff(git(directory, [...GIT_DIFF_ARGUMENTS, "HEAD~1...HEAD"]))
    for (const name of NAMES) {
      expect(hasDiffLine(lines, name, "RIGHT", 1)).toBe(true)
      expect(hasDiffLine(lines, name, "LEFT", 1)).toBe(true)
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
