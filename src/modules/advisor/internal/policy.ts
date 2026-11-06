const REMIND_EVERY = 5;
export const TIMING = `You have access to an "advisor" tool backed by a stronger reviewer model. It takes NO parameters — when you call advisor(), your entire conversation history is automatically forwarded. They see the task, every tool call you've made, every result you've seen.

Call advisor BEFORE substantive work — before writing, before committing to an interpretation, before building on an assumption. If the task requires orientation first (finding files, fetching a source, seeing what's there), do that, then call advisor. Orientation is not substantive work. Writing, editing, and declaring an answer are.

Also call advisor:
- When you believe the task is complete. BEFORE this call, make your deliverable durable: write the file, save the result, commit the change. The advisor call takes time; if the session ends during it, a durable result persists and an unwritten one doesn't.
- When stuck — errors recurring, approach not converging, results that don't fit.
- When considering a change of approach.

On tasks longer than a few steps, call advisor at least once before committing to an approach and once before declaring done. On short reactive tasks where the next action is dictated by tool output you just read, you don't need to keep calling — the advisor adds most of its value on the first call, before the approach crystallizes.

Give the advice serious weight. If you follow a step and it fails empirically, or you have primary-source evidence that contradicts a specific claim (the file says X, the paper states Y), adapt. A passing self-test is not evidence the advice is wrong — it's evidence your test doesn't check what the advice is checking.

If you've already retrieved data pointing one way and the advisor points another: don't silently switch. Surface the conflict in one more advisor call — "I found X, you suggest Y, which constraint breaks the tie?" The advisor saw your evidence but may have underweighted it; a reconcile call is cheaper than committing to the wrong branch.`;

export const REMINDER =
	"<system-reminder>\n" +
	"Já se passaram " + REMIND_EVERY + " turnos desde a última consulta ao advisor. Pergunte-se agora:\n" +
	"- Estou repetindo uma tentativa que já falhou, ou os resultados não batem com o que eu esperava?\n" +
	"- Vou mudar de abordagem, ou acabei de concluir algo que ainda não revisei?\n" +
	"- O usuário me corrigiu ou perguntou algo que eu não sei responder com o que está no histórico?\n" +
	"Se alguma resposta for sim, chame o advisor agora. Se a próxima ação já está clara pelo último resultado, não chame e siga.\n" +
	"</system-reminder>";

export const ADVISOR_SYSTEM = `You are the advisor: a stronger model that a faster executor model consults in the middle of a task.
You have no tools and cannot act. Below you get the executor's system prompt and its full transcript so far (user messages, the executor's text, every tool call and tool result), ending at the moment it called advisor(). Earlier advisor results appear in the transcript too.

Your job is to give strategic guidance the executor then acts on:
- Before substantive work: the approach to take, the decisions that matter, the pitfalls, and what to verify.
- When the executor is stuck or changing course: diagnose why, and say concretely what to do instead.
- When the executor believes it is done: review critically — missing requirements, bugs, unverified claims, edge cases, things left in a bad state — and say explicitly whether it is fine to finish.

Rules:
- Be specific and actionable; refer to the files, commands and results in the transcript. Order points by importance.
- Do not rewrite the whole solution, do not repeat the transcript, do not pad. If the executor is on track, say so in a line.
- Correct wrong assumptions even when the executor stated them confidently, and say what evidence would settle a doubt.
- Answer in the language the user is using.`;

// ───────────────────────── transcript ─────────────────────────

const TOOL_RESULT_CHARS = 12_000;

export function clip(s: string, n: number): string {
	if (s.length <= n) return s;
	const head = Math.floor(n * 0.6);
	return s.slice(0, head) + "\n[... " + (s.length - n) + " chars omitted ...]\n" + s.slice(s.length - (n - head));
}

function contentText(c: any): string {
	if (typeof c === "string") return c;
	if (!Array.isArray(c)) return "";
	return c
		.map((b: any) => (b?.type === "text" ? b.text : b?.type === "image" ? "[image omitted]" : ""))
		.filter(Boolean)
		.join("\n");
}

function renderMessage(m: any, limit: number): string | undefined {
	switch (m?.role) {
		case "user":
			return "[user]\n" + contentText(m.content);
		case "assistant": {
			const parts: string[] = [];
			for (const b of m.content ?? []) {
				if (b.type === "text" && b.text) parts.push(b.text);
				else if (b.type === "toolCall") parts.push("[tool_call " + b.name + "] " + clip(JSON.stringify(b.arguments ?? {}), limit));
			}
			return parts.length ? "[assistant]\n" + parts.join("\n") : undefined;
		}
		case "toolResult":
			return "[tool_result " + m.toolName + (m.isError ? " (error)" : "") + "]\n" + clip(contentText(m.content), limit);
		case "bashExecution":
			return m.excludeFromContext ? undefined : "[user ran shell] $ " + m.command + "\n" + clip(String(m.output ?? ""), limit);
		case "custom":
			return "[context:" + m.customType + "]\n" + clip(contentText(m.content), limit);
		case "branchSummary":
		case "compactionSummary":
			return "[summary of earlier conversation]\n" + String(m.summary ?? "");
		default:
			return undefined;
	}
}

/** Monta o histórico dentro do que cabe na janela do advisor (encolhe resultados, depois descarta o meio). */
export function buildTranscript(messages: any[], budget: number): string {
	let blocks: string[] = [];
	for (const limit of [TOOL_RESULT_CHARS, 4000, 1500, 500]) {
		blocks = messages.map((m) => renderMessage(m, limit)).filter((b): b is string => !!b);
		if (blocks.reduce((n, b) => n + b.length + 2, 0) <= budget) return blocks.join("\n\n");
	}
	const first = blocks[0] ?? "";
	const tail: string[] = [];
	let used = first.length + 200;
	for (let i = blocks.length - 1; i > 0; i--) {
		if (used + blocks[i].length + 2 > budget) break;
		tail.unshift(blocks[i]);
		used += blocks[i].length + 2;
	}
	return [first, "[... " + (blocks.length - 1 - tail.length) + " earlier messages omitted to fit the advisor context window ...]", ...tail].join("\n\n");
}
