#! /usr/bin/env node

const { program } = require("commander");
const { readFile } = require("node:fs/promises");

function getTerminalKeys(obj, accString = "", accArray = []) {
  const keysArray = Object.keys(obj).map((key) => {
    const keyString = accString ? `${accString}.${key}` : key;
    if (typeof obj[key] !== "object") {
      return keyString;
    }
    return getTerminalKeys(obj[key], keyString, accArray);
  });
  return [...accArray, ...keysArray].flat();
}

program
  .command("list")
  .description("list all the keys in the file")
  .option("-f, --file <file>", "file to read")
  .action(async (options) => {
    const filename = options.file;
    try {
      const contents = await readFile(filename, { encoding: "utf8" });
      const json = JSON.parse(contents);
      const allKeys = getTerminalKeys(json);
      console.log("All keys in the file:");
      console.log(`  ${allKeys.join("\n  ")}`);
    } catch (err) {
      console.log(err);
    }
  });

program.parseAsync();
