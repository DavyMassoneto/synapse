import { expect, test } from "vitest"
import { RecordedRunner } from "#synapse/tests/fixtures/shell"
import { describeTree } from "#synapse/tree"

test("marks unavailable files as unreadable rather than empty", () => {
  const recorded = new RecordedRunner(() => "missing-file.ts")
  expect(describeTree((request) => recorded.run(request))).toContain("ilegível missing-file.ts")
})

test("limits the tree after excluding ignored paths", () => {
  const paths = Array.from({ length: 2001 }, (_, index) => `missing-${index}.ts`)
  const recorded = new RecordedRunner(() => [...paths, "package-lock.json"].join("\n"))
  const tree = describeTree((request) => recorded.run(request))
  expect(tree.split("\n")).toHaveLength(2001)
  expect(tree.split("\n").at(-1)).toBe("[1 arquivo(s) omitido(s) da árvore]")
  expect(tree).not.toContain("package-lock.json")
})
