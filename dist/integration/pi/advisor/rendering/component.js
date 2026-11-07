"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textComponent = textComponent;
const pi_tui_1 = require("@earendil-works/pi-tui");
const presentation_1 = require("../presentation");
function textComponent(context) {
    if (context.lastComponent instanceof pi_tui_1.Text) {
        return context.lastComponent;
    }
    return new pi_tui_1.Text("", presentation_1.TEXT_PADDING, presentation_1.TEXT_PADDING);
}
