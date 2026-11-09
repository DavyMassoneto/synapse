import { type AnnotatedDiff, annotateDiff, readDiff } from "../diff"
import { currentHeadSha, listReviewBodies, publishReview } from "../github"
import { callModel, parseReply, type Reply } from "../model"
import { buildPrompt, loadContext } from "../prompt"
import { placeFindings, reviewBody, reviewMarker } from "../review"
import { type Settings } from "../settings"
import { MESSAGE_ALREADY_REVIEWED, MESSAGE_EMPTY_DIFF, MESSAGE_SUPERSEDED } from "./constants"

async function publish(settings: Settings, diff: AnnotatedDiff, reply: Reply): Promise<void> {
  const { github } = settings
  const placement = placeFindings(diff.lines, reply.findings)
  const published = await publishReview(github, {
    commit_id: github.headSha,
    event: "COMMENT",
    body: reviewBody(reply, placement.unplaced, placement.comments.length, github.headSha),
    comments: placement.comments,
  })
  console.log(`Review ${published.html_url}: ${placement.comments.length} comentário(s) em linhas do diff`)
  console.log(`Apontamentos sem linha no diff: ${placement.unplaced.length}`)
}

async function publishIfCurrent(settings: Settings, diff: AnnotatedDiff, reply: Reply): Promise<void> {
  if ((await currentHeadSha(settings.github)) === settings.github.headSha) {
    await publish(settings, diff, reply)
  } else {
    console.log(MESSAGE_SUPERSEDED)
  }
}

async function evaluate(settings: Settings, diff: AnnotatedDiff): Promise<void> {
  const prompt = buildPrompt(loadContext(process.cwd()), diff.text)
  const reply = parseReply(await callModel(settings.model, prompt))
  console.log(`Veredito: ${reply.verdict}; ${reply.findings.length} apontamento(s)`)
  await publishIfCurrent(settings, diff, reply)
}

export async function runEvaluation(settings: Settings): Promise<void> {
  const marker = reviewMarker(settings.github.headSha)
  const bodies = await listReviewBodies(settings.github)
  const diff = annotateDiff(readDiff(settings.github.baseSha, settings.github.headSha))
  if (bodies.some((body) => body.includes(marker))) {
    console.log(MESSAGE_ALREADY_REVIEWED)
  } else if (diff.lines.size === 0) {
    console.log(MESSAGE_EMPTY_DIFF)
  } else {
    await evaluate(settings, diff)
  }
}
