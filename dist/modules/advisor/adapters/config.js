"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileConfig = void 0;
const node_fs_1 = require("node:fs");
const diagnostics_1 = require("./diagnostics");
const parse_config_1 = require("./parse-config");
const replace_config_1 = require("./replace-config");
class FileConfig {
    path;
    constructor(path) {
        this.path = path;
    }
    load() {
        let content;
        try {
            content = (0, node_fs_1.readFileSync)(this.path, "utf8");
        }
        catch (error) {
            if (error instanceof Error && "code" in error && error.code === "ENOENT") {
                return { kind: "missing" };
            }
            return { kind: "invalid", message: diagnostics_1.CONFIG_DIAGNOSTICS.readFailed };
        }
        return (0, parse_config_1.parseConfig)(content);
    }
    save(config) {
        (0, replace_config_1.replaceConfig)(this.path, config);
    }
}
exports.FileConfig = FileConfig;
