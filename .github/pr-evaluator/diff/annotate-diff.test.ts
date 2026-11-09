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
