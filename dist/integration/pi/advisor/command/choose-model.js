"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseModel = chooseModel;
const presentation_1 = require("../presentation");
const limits_1 = require("./limits");
const references_1 = require("./references");
const search_1 = require("./search");
const selection_constants_1 = require("./selection-constants");
const selection_menu_1 = require("./selection-menu");
async function chooseMatch(context, matches) {
    if (!context.hasUI) {
        context.ui.notify(presentation_1.COMMAND_TEXT.ambiguousModel, "warning");
        return selection_constants_1.CANCELLED_SELECTION;
    }
    const choice = await context.ui.select(presentation_1.COMMAND_TEXT.title, matches.slice(0, limits_1.MODEL_SELECTION_LIMIT));
    if (choice === undefined) {
        return selection_constants_1.CANCELLED_SELECTION;
    }
    return { kind: "selected", model: choice };
}
async function chooseModel(context, input) {
    if (!input) {
        return (0, selection_menu_1.selectInitialModel)(context, (0, references_1.modelReferences)(context));
    }
    const matches = (0, search_1.searchModels)((0, references_1.modelReferences)(context), input);
    if (matches.length === 0) {
        context.ui.notify(`Nenhum modelo encontrado: ${input}`, "error");
        return selection_constants_1.CANCELLED_SELECTION;
    }
    if (matches.length === 1) {
        return { kind: "selected", model: matches[0] };
    }
    return chooseMatch(context, matches);
}
