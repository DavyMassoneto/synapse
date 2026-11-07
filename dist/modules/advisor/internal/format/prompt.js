"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preparePrompt = preparePrompt;
const constants_1 = require("../constants");
const clip_1 = require("./clip");
const limits_1 = require("./limits");
const prompt_text_1 = require("./prompt-text");
const transcript_1 = require("./transcript");
function availableBudget(model) {
    const requiredOutputTokens = model.reasoningTokens + limits_1.MINIMUM_ANSWER_TOKENS;
    if (requiredOutputTokens > model.maxOutputTokens) {
        return undefined;
    }
    const inputTokens = model.contextWindow - limits_1.HOST_SAFETY_TOKENS - model.maxOutputTokens;
    if (inputTokens <= 0) {
        return undefined;
    }
    const available = inputTokens * limits_1.ESTIMATED_CHARACTERS_PER_TOKEN - constants_1.ADVISOR_SYSTEM.length;
    const fixedLength = prompt_text_1.PROMPT_PREFIX.length + prompt_text_1.TRANSCRIPT_PREFIX.length + prompt_text_1.PROMPT_SUFFIX.length;
    if (available <= fixedLength) {
        return undefined;
    }
    return available - fixedLength;
}
function preparePrompt(input, model) {
    const budget = availableBudget(model);
    if (budget === undefined) {
        return undefined;
    }
    const systemLimit = Math.min(limits_1.MAX_SYSTEM_CHARACTERS, Math.floor(budget / 2));
    const system = (0, clip_1.clip)(input.system, systemLimit);
    const transcriptBudget = budget - system.length;
    const transcript = (0, transcript_1.buildTranscript)(input.messages, transcriptBudget);
    return prompt_text_1.PROMPT_PREFIX + system + prompt_text_1.TRANSCRIPT_PREFIX + transcript + prompt_text_1.PROMPT_SUFFIX;
}
