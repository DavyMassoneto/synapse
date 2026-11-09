import { type Task } from "./types"

export async function mapWithLimit<Item, Result>(
  items: readonly Item[],
  limit: number,
  task: Task<Item, Result>,
): Promise<Result[]> {
  const results: Result[] = []
  for (let start = 0; start < items.length; start += limit) {
    const batch = items.slice(start, start + limit)
    results.push(...(await Promise.all(batch.map((item) => task(item)))))
  }
  return results
}
