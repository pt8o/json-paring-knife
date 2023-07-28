#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const promises_1 = require("node:fs/promises");
const utils_1 = require("./utils");
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
    // .requiredOption(
    //   "-d, --destination <destination>",
    //   "destination folder to write"
    // )
    .requiredOption("-k, --keys <keys>", "keys to delete (comma separated strings)")
    .action(async (options) => {
    const { source, keys: keysRaw } = options;
    try {
        const contents = await (0, promises_1.readFile)(source, { encoding: "utf8" });
        const json = JSON.parse(contents);
        const keys = keysRaw.split(",");
        const entriesToMigrate = {};
        try {
            keys.forEach((key) => {
                const deletedValue = (0, utils_1.deleteTerminalEntry)(json, key);
                if (deletedValue === false)
                    return;
                (0, utils_1.insertEntryFromDottedKeyString)({
                    obj: entriesToMigrate,
                    keyString: key,
                    value: deletedValue,
                });
                // iterate through parent, delete parent if empty
                const keys = key.split(".");
                for (let i = keys.length - 1; i > 0; i--) {
                    const keyString = keys.slice(0, i).join(".");
                    (0, utils_1.deleteTerminalEntry)(json, keyString, true);
                }
                console.log(JSON.stringify(json, null, 2));
            });
        }
        catch (err) {
            console.error(err);
        }
        await (0, promises_1.writeFile)(source, JSON.stringify(json, null, 2));
        console.log(JSON.stringify(entriesToMigrate, null, 2));
    }
    catch (err) {
        console.error(err);
    }
});
commander_1.program.parseAsync();
