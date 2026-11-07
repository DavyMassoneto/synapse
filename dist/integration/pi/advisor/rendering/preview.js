"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPreview = renderPreview;
const presentation_1 = require("../presentation");
function renderPreview(body, model, expanded, theme) {
    const lines = body.split("\n");
    let shown = lines;
    if (!expanded) {
        shown = lines.slice(0, presentation_1.PREVIEW_LINES);
    }
    const remaining = lines.length - shown.length;
    let suffix = "";
    if (!expanded && remaining > 0) {
        suffix = `\n${theme.fg(presentation_1.ADDITIONAL_COLOR, `... (${remaining} linhas a mais)`)}`;
    }
    let title = presentation_1.RENDER_TEXT.success;
    if (model) {
        title = `${title} (${model})`;
    }
    return `${theme.fg(presentation_1.SUCCESS_COLOR, title)}\n${shown.join("\n")}${suffix}`;
}
