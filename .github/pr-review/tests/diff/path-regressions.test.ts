import { describe, expect, test } from "vitest"
import { listDeletedPaths, parseDiff } from "#synapse/diff"
import { decodeGitPath } from "#synapse/diff/paths"

test("preserves escaped literal backslashes before escape-like suffixes", () => {
  expect(decodeGitPath(String.raw`"a\\tb"`)).toBe(String.raw`a\tb`)
  expect(decodeGitPath(String.raw`"a\\303.ts"`)).toBe(String.raw`a\303.ts`)
})

describe("diff path regressions", () => {
  test("decodes quoted rename targets and UTF-8 octal escapes", () => {
    const diff =
      'diff --git a/old.ts "b/caf\\303\\251.ts"\nrename from old.ts\nrename to "caf\\303\\251.ts"\n--- a/old.ts\n+++ "b/caf\\303\\251.ts"\n@@ -1 +1 @@\n-a\n+b'
    expect(parseDiff(diff).at(0)?.path).toBe("café.ts")
    expect(parseDiff(diff).at(0)?.addedLines).toEqual(new Set([1]))
  })

  test("includes binary additions as files without commentable lines", () => {
    const files = parseDiff(
      "diff --git a/img.bin b/img.bin\nnew file mode 100644\nBinary files /dev/null and b/img.bin differ",
    )
    expect(files.map((file) => file.path)).toEqual(["img.bin"])
    expect(files.at(0)?.commentableLines.size).toBe(0)
  })

  test("lists binary deletions without reviewing their missing contents", () => {
    const diff = "diff --git a/img.bin b/img.bin\ndeleted file mode 100644\nBinary files a/img.bin and /dev/null differ"
    expect(listDeletedPaths(diff)).toEqual(["img.bin"])
    expect(parseDiff(diff)).toEqual([])
  })
})
