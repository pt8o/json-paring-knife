#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const promises_1 = require("node:fs/promises");
function getTerminalKeys(obj, accString = "", accArray = []) {
    const keysArray = Object.keys(obj).map((key) => {
        const keyString = accString ? `${accString}.${key}` : key;
        if (typeof obj[key] === "string") {
            return [keyString];
        }
        return getTerminalKeys(obj[key], keyString, accArray);
    });
    return [...accArray, ...keysArray.flat()];
}
function deleteTerminalKey(obj, key) {
    const keysArray = key.split(".");
    const lastKey = keysArray.pop();
    Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === "object") {
            deleteTerminalKey(value, key);
        }
    });
    const lastObj = keysArray.reduce((acc, key) => {
        // since we've popped the last key, we know that the final value here is an object
        return acc[key];
    }, obj);
    if (!lastKey || !lastObj[lastKey]) {
        throw new Error(`Did not find key "${key}"`);
    }
    delete lastObj[lastKey];
}
commander_1.program
    .command("list")
    .description("list all the keys in the file")
    .requiredOption("-s, --source <source>", "source file to read")
    .action(async (options) => {
    const { source } = options;
    try {
        const contents = await (0, promises_1.readFile)(source, { encoding: "utf8" });
        const json = JSON.parse(contents);
        const allKeys = getTerminalKeys(json);
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
        try {
            keys.forEach((key) => {
                deleteTerminalKey(json, key);
                console.log(JSON.stringify(json));
            });
        }
        catch (err) {
            console.error(err);
        }
    }
    catch (err) {
        console.error(err);
    }
});
commander_1.program.parseAsync();
