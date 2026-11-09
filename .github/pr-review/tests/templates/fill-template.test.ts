import { describe, expect, test } from "vitest"
import { fillTemplate } from "#synapse/templates"

describe("fillTemplate", () => {
  test("fills the placeholders in order", () => {
    expect(fillTemplate("texto", [])).toBe("texto")
    expect(fillTemplate("a {} b {} c", ["1", "2"])).toBe("a 1 b 2 c")
  })

  test("does not expand a placeholder inside a value", () => {
    expect(fillTemplate("x {} y {}", ["{}", "2"])).toBe("x {} y 2")
  })

  test("rejects a different number of values", () => {
    expect(() => fillTemplate("{} {}", ["1"])).toThrow()
  })
})
