export interface EntryRegistrationExpectation {
  tools: string[]
  commands: string[]
  events: string[]
  eventCounts: number[]
}

export interface EntryVirtualModelExpectation {
  provider: string
  id: string
}
