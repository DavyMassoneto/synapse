"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAdvisorResult = renderAdvisorResult;
const presentation_1 = require("../presentation");
const component_1 = require("./component");
const preview_1 = require("./preview");
function renderAdvisorResult(result, options, theme, context) {
    const text = (0, component_1.textComponent)(context);
    if (options.isPartial) {
        text.setText(theme.fg(presentation_1.PENDING_COLOR, presentation_1.RENDER_TEXT.pending));
        return text;
    }
    const content = [];
    for (const block of result.content) {
        if (block.type === "text") {
            content.push(block.text);
        }
    }
    const body = content.join("\n");
    if (context.isError) {
        text.setText(theme.fg(presentation_1.ERROR_COLOR, body));
        return text;
    }
    text.setText((0, preview_1.renderPreview)(body, result.details?.model, options.expanded, theme));
    return text;
}
