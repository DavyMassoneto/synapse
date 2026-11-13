import { createAgentTeam } from "../public"
import { TEAM_TEST_ALICE_REQUEST } from "./constants"
import { TeamTestLead, TeamTestSessions } from "./doubles"
import { type TeamGenerationSut, type TeamTestSut } from "./types"

function teamTestClock(): string {
  return "12:00"
}

export function makeTeamSut(): TeamTestSut {
  const lead = new TeamTestLead()
  const sessions = new TeamTestSessions()
  return { lead, sessions, team: createAgentTeam(lead, sessions, teamTestClock) }
}

export async function startAlice(): Promise<TeamTestSut> {
  const sut = makeTeamSut()
  await sut.team.start(TEAM_TEST_ALICE_REQUEST)
  return sut
}

export async function failedAliceAcceptance(): Promise<TeamTestSut> {
  const sut = makeTeamSut()
  sut.sessions.journal.failAt = 1
  await sut.team.start(TEAM_TEST_ALICE_REQUEST)
  return sut
}

export async function failedAliceRecord(): Promise<TeamTestSut> {
  const sut = makeTeamSut()
  sut.lead.failRecord = true
  await sut.team.start(TEAM_TEST_ALICE_REQUEST)
  return sut
}

export async function failedAliceStart(): Promise<TeamTestSut> {
  const sut = makeTeamSut()
  sut.sessions.journal.failAt = 2
  await sut.team.start(TEAM_TEST_ALICE_REQUEST)
  return sut
}

export async function replacedAliceGeneration(): Promise<TeamGenerationSut> {
  const sut = makeTeamSut()
  sut.sessions.held = true
  const previous = sut.team.start({ ...TEAM_TEST_ALICE_REQUEST, description: "antiga" })
  await sut.team.suspend()
  await sut.team.restore([], [])
  const current = sut.team.start({ ...TEAM_TEST_ALICE_REQUEST, description: "nova" })
  sut.sessions.releaseFirst()
  const previousResult = await previous
  return { ...sut, current, previousResult }
}
