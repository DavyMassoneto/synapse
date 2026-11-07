"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceConfig = replaceConfig;
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const cleanup_temporary_1 = require("./cleanup-temporary");
function replaceConfig(path, config) {
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(path), { recursive: true });
    const temporary = `${path}.${(0, node_crypto_1.randomUUID)()}.tmp`;
    try {
        (0, node_fs_1.writeFileSync)(temporary, `${JSON.stringify(config, null, 2)}\n`, { flag: "wx" });
        (0, node_fs_1.renameSync)(temporary, path);
    }
    catch (error) {
        (0, cleanup_temporary_1.cleanupTemporary)(temporary);
        throw error;
    }
}
