"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupTemporary = cleanupTemporary;
const node_fs_1 = require("node:fs");
function cleanupTemporary(path) {
    try {
        (0, node_fs_1.rmSync)(path, { force: true });
    }
    catch {
        // Cleanup must not replace the original write failure.
    }
}
