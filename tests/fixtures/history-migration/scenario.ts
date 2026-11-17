import { PiProcess, PiProcessHome } from "../pi-process"
import { HISTORY_MIGRATION_CLEANUP_FAILURE } from "./constants"
import { HistoryMigrationFixture } from "./fixture"
import { type HistoryMigrationScenario } from "./types"

export async function runHistoryMigrationScenario(scenario: HistoryMigrationScenario): Promise<void> {
  const home = new PiProcessHome()
  try {
    const process = new PiProcess(home)
    try {
      const fixture = new HistoryMigrationFixture(home, process)
      fixture.initialize()
      await scenario(fixture)
    } catch (error) {
      try {
        await process.dispose()
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], HISTORY_MIGRATION_CLEANUP_FAILURE)
      }
      throw error
    }
    await process.dispose()
  } catch (error) {
    try {
      home.remove()
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], HISTORY_MIGRATION_CLEANUP_FAILURE)
    }
    throw error
  }
}
