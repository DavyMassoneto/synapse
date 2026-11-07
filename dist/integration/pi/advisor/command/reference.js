"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelReference = modelReference;
function modelReference(model) {
    return [model.provider, model.id].join("/");
}
