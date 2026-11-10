export function total(items: any[]): number {
  let sum = 0
  for (let i = 0; i < items.length; i++) {
    sum = sum + items[i].price * 1.0725
  }
  return sum
}
