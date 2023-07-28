#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const promises_1 = require("node:fs/promises");
const utils_1 = require("./utils");
const { version } = require("../package.json");
commander_1.program.version(version, "-v, -V, --version", "output the current version");
commander_1.program
    .command("list")
    .description("list all the keys in the file")
    .requiredOption("-s, --source <source>", "source file to read")
    .action(async (options) => {
    const { source } = options;
    try {
        const contents = await (0, promises_1.readFile)(source, { encoding: "utf8" });
        const json = JSON.parse(contents);
        const allKeys = (0, utils_1.getTerminalKeys)(json);
        console.log("All keys in the file:");
        console.log(`  ${allKeys.join("\n  ")}`);
    }
    catch (err) {
        console.error(err);
    }
});
commander_1.program
    .command("pare")
    .description("delete --keys from --source file, save in --destination folder")
    .requiredOption("-s, --source <source>", "source file to read")
    .requiredOption("-d, --destination <destination>", "destination folder to write")
    .requiredOption("-k, --keys <keys>", "keys to delete (comma separated strings)")
    .action(async (options) => {
    const { source, destination, keys: commaSeparatedKeys } = options;
    const keys = commaSeparatedKeys.split(",");
    const sourceArray = source.split("/");
    sourceArray.pop();
    const sourceDir = `${sourceArray.join("/")}/`;
    const destDir = destination.endsWith("/")
        ? destination
        : `${destination}/`;
    const files = (await (0, promises_1.readdir)(sourceDir)).filter((file) => file.endsWith(".json"));
    files.forEach(async (filename) => {
        const sourceFile = `${sourceDir}${filename}`;
        const destFile = `${destDir}${filename}`;
        try {
            const contents = await (0, promises_1.readFile)(sourceFile, {
                encoding: "utf8",
            });
            const sourceObj = JSON.parse(contents);
            const destObj = {};
            try {
                keys.forEach((key) => {
                    const deletedValue = (0, utils_1.deleteTerminalEntry)(sourceObj, key);
                    if (deletedValue === false)
                        return;
                    (0, utils_1.insertEntryFromDottedKeyString)({
                        obj: destObj,
                        keyString: key,
                        value: deletedValue,
                    });
                    // recursively iterate through parents, delete if empty
                    const keys = key.split(".");
                    for (let i = keys.length - 1; i > 0; i--) {
                        const keyString = keys.slice(0, i).join(".");
                        (0, utils_1.deleteTerminalEntry)(sourceObj, keyString, true);
                    }
                });
            }
            catch (err) {
                console.error(err);
                return;
            }
            await (0, promises_1.writeFile)(sourceFile, JSON.stringify(sourceObj, null, 2));
            await (0, promises_1.writeFile)(destFile, JSON.stringify(destObj, null, 2));
        }
        catch (err) {
            console.error(err);
        }
    });
});
commander_1.program.parseAsync();
