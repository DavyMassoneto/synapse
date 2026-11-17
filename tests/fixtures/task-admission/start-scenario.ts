import { TaskSelectionFixture } from "../task-selection"
import { ADMISSION_SCRIPT } from "./constants"
import { AdmissionFaults } from "./faults"

export async function startAdmissionScenario() {
  const faults = new AdmissionFaults()
  const fixture = new TaskSelectionFixture(ADMISSION_SCRIPT, faults.mount.bind(faults))
  try {
    const session = await fixture.start()
    await fixture.step()
    return { fixture, session, faults }
  } catch (error) {
    await fixture.close()
    throw error
  }
}
