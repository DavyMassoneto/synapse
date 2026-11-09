import { expect, test } from "vitest"
import { annotateDiff } from "./annotate-diff"
import { hasDiffLine, hasDiffRange } from "./predicates"

const MODIFIED = [
  "diff --git a/src/a.ts b/src/a.ts",
  "index 111..222 100644",
  "--- a/src/a.ts",
  "+++ b/src/a.ts",
  "@@ -3,4 +3,5 @@ function a() {",
  " keep",
  "-old",
  "--- a/outro.ts",
  "+new",
  "+another",
  " tail",
  "\\ No newline at end of file",
  "",
].join("\n")

const ADDED = [
  "diff --git a/src/b.ts b/src/b.ts",
  "new file mode 100644",
  "--- /dev/null",
  "+++ b/src/b.ts",
  "@@ -0,0 +1,2 @@",
  "+first",
  "+second",
  "",
].join("\n")

const DELETED = [
  "diff --git a/src/c.ts b/src/c.ts",
  "deleted file mode 100644",
  "--- a/src/c.ts",
  "+++ /dev/null",
  "@@ -1,2 +0,0 @@",
  "-gone",
  "-also gone",
  "",
].join("\n")

test("numera linhas adicionadas e de contexto no arquivo novo e removidas no antigo", () => {
  const annotated = annotateDiff(MODIFIED)
  expect(annotated.text).toContain("R3  keep")
  expect(annotated.text).toContain("L4 -old")
  expect(annotated.text).toContain("L5 --- a/outro.ts")
  expect(annotated.text).toContain("R4 +new")
  expect(annotated.text).toContain("R5 +another")
  expect(annotated.text).toContain("R6  tail")
  expect(annotated.text).toContain("\\ No newline at end of file")
})

test("registra exatamente as linhas que o diff mostra", () => {
  const { lines } = annotateDiff(MODIFIED)
  expect(hasDiffLine(lines, "src/a.ts", "RIGHT", 4)).toBe(true)
  expect(hasDiffLine(lines, "src/a.ts", "RIGHT", 7)).toBe(false)
  expect(hasDiffLine(lines, "src/a.ts", "LEFT", 4)).toBe(true)
  expect(hasDiffLine(lines, "src/a.ts", "LEFT", 3)).toBe(false)
  expect(hasDiffLine(lines, "src/outro.ts", "RIGHT", 4)).toBe(false)
})

test("arquivo novo só tem linhas à direita", () => {
  const { lines } = annotateDiff(ADDED)
  expect(hasDiffRange(lines, "src/b.ts", "RIGHT", 1, 2)).toBe(true)
  expect(hasDiffLine(lines, "src/b.ts", "LEFT", 1)).toBe(false)
})

test("arquivo removido usa o caminho antigo e só tem linhas à esquerda", () => {
  const { lines } = annotateDiff(DELETED)
  expect(hasDiffRange(lines, "src/c.ts", "LEFT", 1, 2)).toBe(true)
  expect(hasDiffLine(lines, "src/c.ts", "RIGHT", 1)).toBe(false)
})

test("intervalo não cruza trechos nem linhas fora do diff", () => {
  const { lines } = annotateDiff(MODIFIED)
  expect(hasDiffRange(lines, "src/a.ts", "RIGHT", 3, 6)).toBe(true)
  expect(hasDiffRange(lines, "src/a.ts", "RIGHT", 3, 9)).toBe(false)
  expect(hasDiffRange(lines, "src/a.ts", "RIGHT", 6, 3)).toBe(false)
})

const RENAMED = [
  "diff --git a/old.ts b/new.ts",
  "similarity index 90%",
  "rename from old.ts",
  "rename to new.ts",
  "--- a/old.ts",
  "+++ b/new.ts",
  "@@ -1,2 +1,2 @@",
  " same",
  "-before",
  "+after",
  "",
].join("\n")

const SPACED = [
  "diff --git a/dir with space/f.ts b/dir with space/f.ts",
  "--- a/dir with space/f.ts\t",
  "+++ b/dir with space/f.ts\t",
  "@@ -1 +1 @@",
  "-x",
  "+y",
  "",
].join("\n")

const QUOTED = [
  'diff --git "a/dir/q\\"uote.ts" "b/dir/q\\"uote.ts"',
  '--- "a/dir/q\\"uote.ts"',
  '+++ "b/dir/q\\"uote.ts"',
  "@@ -1 +1 @@",
  "-x",
  "+y",
  "",
].join("\n")

const TWO_HUNKS = [
  "diff --git a/m.ts b/m.ts",
  "--- a/m.ts",
  "+++ b/m.ts",
  "@@ -1,2 +1,2 @@",
  " a",
  "-b",
  "+c",
  "@@ -40,2 +40,3 @@",
  " far",
  "+extra",
  " end",
  "",
].join("\n")

const BINARY = [
  "diff --git a/x.png b/x.png",
  "index 111..222 100644",
  "Binary files a/x.png and b/x.png differ",
  "",
].join("\n")

test("renomeação usa o caminho novo para os dois lados", () => {
  const { lines } = annotateDiff(RENAMED)
  expect(hasDiffLine(lines, "new.ts", "RIGHT", 2)).toBe(true)
  expect(hasDiffLine(lines, "new.ts", "LEFT", 2)).toBe(true)
  expect(hasDiffLine(lines, "old.ts", "RIGHT", 2)).toBe(false)
})

test("caminho com espaço e sufixo de tabulação do git", () => {
  expect(hasDiffLine(annotateDiff(SPACED).lines, "dir with space/f.ts", "RIGHT", 1)).toBe(true)
})

test("caminho entre aspas com escapes do git", () => {
  expect(hasDiffLine(annotateDiff(QUOTED).lines, 'dir/q"uote.ts', "RIGHT", 1)).toBe(true)
})

test("o segundo trecho recomeça a numeração e não liga os trechos", () => {
  const { lines, text } = annotateDiff(TWO_HUNKS)
  expect(text).toContain("R41 +extra")
  expect(text).toContain("L2 -b")
  expect(hasDiffRange(lines, "m.ts", "RIGHT", 2, 41)).toBe(false)
  expect(hasDiffRange(lines, "m.ts", "RIGHT", 40, 42)).toBe(true)
})

test("arquivo binário não tem linhas comentáveis", () => {
  expect(annotateDiff(BINARY).lines.size).toBe(0)
})
