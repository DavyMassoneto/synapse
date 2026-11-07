"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectInitialModel = selectInitialModel;
const presentation_1 = require("../presentation");
async function selectInitialModel(context, models) {
    const options = new Map();
    options.set(presentation_1.COMMAND_TEXT.disabledOption, { kind: "disabled" });
    for (const model of models) {
        options.set(model, { kind: "selected", model });
    }
    const choice = await context.ui.select(presentation_1.COMMAND_TEXT.title, [...options.keys()]);
    if (choice === undefined) {
        return { kind: "cancelled" };
    }
    return options.get(choice) ?? { kind: "cancelled" };
}
