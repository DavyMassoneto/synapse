export type Task<Item, Result> = (item: Item) => Promise<Result>
