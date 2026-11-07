"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultTool = consultTool;
const model_1 = require("../model");
const presentation_1 = require("../presentation");
const transcript_1 = require("../transcript");
const failure_1 = require("./failure");
const result_1 = require("./result");
async function consultTool(advisor, signal, context, onUpdate) {
    try {
        onUpdate?.({ content: [{ type: "text", text: presentation_1.TOOL_TEXT.progress }], details: {} });
        const model = new model_1.AdvisorModel(context.modelRegistry);
        const result = await advisor.consult({ system: context.getSystemPrompt(), messages: (0, transcript_1.captureTranscript)(context), signal }, model);
        return (0, result_1.consultationResult)(result);
    }
    catch (error) {
        if (signal.aborted) {
            return (0, failure_1.toolFailure)(presentation_1.TOOL_TEXT.cancelled);
        }
        let message = String(error);
        if (error instanceof Error) {
            message = error.message;
        }
        return (0, failure_1.toolFailure)(`Advisor indisponível: ${message}.`);
    }
}
