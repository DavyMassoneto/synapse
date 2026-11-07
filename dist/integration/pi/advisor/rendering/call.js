"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderAdvisorCall = renderAdvisorCall;
const presentation_1 = require("../presentation");
const component_1 = require("./component");
function renderAdvisorCall(_input, theme, context) {
    const text = (0, component_1.textComponent)(context);
    text.setText(theme.fg(presentation_1.TITLE_COLOR, theme.bold(presentation_1.RENDER_TEXT.title)));
    return text;
}
