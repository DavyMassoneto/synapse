import { describe, expect, test } from "vitest"
import { mapWithLimit } from "#synapse/concurrency"

describe("mapWithLimit", () => {
  test("keeps the order of the items", async () => {
    expect(await mapWithLimit([1, 2, 3, 4, 5], 2, (item) => Promise.resolve(item * 10))).toEqual([10, 20, 30, 40, 50])
  })

  test("never runs more tasks at once than the limit", async () => {
    let running = 0
    let peak = 0
    await mapWithLimit([1, 2, 3, 4, 5, 6], 2, async () => {
      running += 1
      peak = Math.max(peak, running)
      await Promise.resolve()
      running -= 1
    })
    expect(peak).toBe(2)
  })
})
