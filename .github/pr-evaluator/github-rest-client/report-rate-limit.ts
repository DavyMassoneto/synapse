export function reportRateLimit(response: Response): void {
  console.log(`GitHub limitou a taxa (${response.status}); nova tentativa`)
}
