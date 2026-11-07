"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectInitialModel = selectInitialModel;
const presentation_1 = require("../presentation");
const selection_constants_1 = require("./selection-constants");
async function selectInitialModel(context, models) {
    const options = new Map();
    options.set(presentation_1.COMMAND_TEXT.disabledOption, { kind: "disabled" });
    for (const model of models) {
        options.set(model, { kind: "selected", model });
    }
    const choice = await context.ui.select(presentation_1.COMMAND_TEXT.title, [...options.keys()]);
    if (choice === undefined) {
        return selection_constants_1.CANCELLED_SELECTION;
    }
    return options.get(choice) ?? selection_constants_1.CANCELLED_SELECTION;
}
