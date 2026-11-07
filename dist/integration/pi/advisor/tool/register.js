"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTool = registerTool;
const constants_1 = require("../constants");
const presentation_1 = require("../presentation");
const rendering_1 = require("../rendering");
const schema_1 = require("../schema");
const tool_1 = require("./tool");
function registerTool(pi, advisor, lifetime) {
    const handler = new tool_1.AdvisorToolHandler(advisor, lifetime);
    pi.registerTool({
        name: constants_1.ADVISOR_NAME,
        label: constants_1.ADVISOR_LABEL,
        executionMode: constants_1.ADVISOR_EXECUTION_MODE,
        parameters: schema_1.advisorParameters,
        description: presentation_1.ADVISOR_TOOL_DESCRIPTION,
        promptSnippet: presentation_1.ADVISOR_TOOL_SNIPPET,
        renderCall: rendering_1.renderAdvisorCall,
        renderResult: rendering_1.renderAdvisorResult,
        execute: handler.execute.bind(handler),
    });
}
