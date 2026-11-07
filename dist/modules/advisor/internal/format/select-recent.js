"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRecent = selectRecent;
const clip_1 = require("./clip");
const limits_1 = require("./limits");
function selectRecent(blocks, budget) {
    let remaining = budget;
    const selected = [];
    for (let index = blocks.length - 1; index > 0; index--) {
        const available = remaining - limits_1.SEPARATOR.length;
        if (available <= 0) {
            break;
        }
        const block = blocks[index];
        if (block.length > available) {
            if (selected.length === 0) {
                selected.unshift((0, clip_1.clip)(block, available));
            }
            break;
        }
        selected.unshift(block);
        remaining -= block.length + limits_1.SEPARATOR.length;
    }
    return selected;
}
