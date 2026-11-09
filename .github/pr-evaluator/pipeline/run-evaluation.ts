import { type AnnotatedDiff, annotateDiff, readDiff } from "../diff"
import { currentHeadSha, listBotReviewBodies, publishReview } from "../github"
import { callModel, parseReply, type Reply } from "../model"
import { buildPrompt, loadContext } from "../prompt"
import { placeFindings, reviewBody, reviewMarker } from "../review"
import { type Settings } from "../settings"
import { MESSAGE_ALREADY_REVIEWED, MESSAGE_EMPTY_DIFF, MESSAGE_NO_TEXT_LINES, MESSAGE_SUPERSEDED } from "./constants"

async function wasReviewed(settings: Settings): Promise<boolean> {
  const marker = reviewMarker(settings.github.headSha)
  const bodies = await listBotReviewBodies(settings.github)
  return bodies.some((body) => body.includes(marker))
}

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
  if ((await currentHeadSha(settings.github)) !== settings.github.headSha) {
    console.log(MESSAGE_SUPERSEDED)
  } else if (await wasReviewed(settings)) {
    console.log(MESSAGE_ALREADY_REVIEWED)
  } else {
    await publish(settings, diff, reply)
  }
}

async function evaluate(settings: Settings, diff: AnnotatedDiff): Promise<void> {
  const prompt = buildPrompt(loadContext(process.cwd()), diff.text)
  const reply = parseReply(await callModel(settings.model, prompt))
  console.log(`Veredito: ${reply.verdict}; ${reply.findings.length} apontamento(s)`)
  await publishIfCurrent(settings, diff, reply)
}

export async function runEvaluation(settings: Settings): Promise<void> {
  const text = readDiff(settings.github.baseSha, settings.github.headSha)
  const diff = annotateDiff(text)
  if (await wasReviewed(settings)) {
    console.log(MESSAGE_ALREADY_REVIEWED)
  } else if (text.trim().length === 0) {
    console.log(MESSAGE_EMPTY_DIFF)
  } else if (diff.lines.size === 0) {
    console.log(MESSAGE_NO_TEXT_LINES)
  } else {
    await evaluate(settings, diff)
  }
}
