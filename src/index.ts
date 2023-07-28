#! /usr/bin/env node

import { program } from "commander";
import { readFile, writeFile, readdir } from "node:fs/promises";

import {
  deleteTerminalEntry,
  getTerminalKeys,
  insertEntryFromDottedKeyString,
} from "./utils";
import { JsonObject } from "./types";

const { version } = require("../package.json");
program.version(version, "-v, -V, --version", "output the current version");

program
  .command("list")
  .description("list all the keys in the file")
  .requiredOption("-s, --source <source>", "source file/folder to read")
  .action(async (options) => {
    const { source } = options;

    let sourceFile = source;
    if (!source.endsWith(".json")) {
      const sourceDir = source.endsWith("/") ? source : `${source}/`;
      const firstFile = (await readdir(sourceDir)).find((file) =>
        file.endsWith(".json")
      );
      sourceFile = `${sourceDir}${firstFile}`;
    }

    try {
      const contents = await readFile(sourceFile, { encoding: "utf8" });
      const json = JSON.parse(contents);
      const allKeys = getTerminalKeys(json);
      console.log(`All keys in the file ${sourceFile}:`);
      console.log(`  ${allKeys.join("\n  ")}`);
    } catch (err) {
      console.error(err);
    }
  });

program
  .command("pare")
  .description(
    "delete `keys` from JSON files in the `source` folder, save in `destination` folder"
  )
  .requiredOption("-s, --source <source>", "source file/folder to read")
  .requiredOption(
    "-d, --destination <destination>",
    "destination folder to write"
  )
  .requiredOption(
    "-k, --keys <keys>",
    "keys to delete (comma separated strings)"
  )
  .action(
    async (options: { source: string; destination: string; keys: string }) => {
      const { source, destination, keys: commaSeparatedKeys } = options;
      const keys = commaSeparatedKeys.split(",");

      let files: string[] = [];
      let sourceDir = "";
      let destDir = "";
      destDir = destination.endsWith("/") ? destination : `${destination}/`;

      if (source.endsWith(".json")) {
        const sourceArray = source.split("/");
        const file = sourceArray.pop()!;
        files = [file];
        sourceDir = `${sourceArray.join("/")}/`;
      } else {
        sourceDir = source.endsWith("/") ? source : `${source}/`;

        files = (await readdir(sourceDir)).filter((file) =>
          file.endsWith(".json")
        );
      }

      files.forEach(async (filename) => {
        const sourceFile = `${sourceDir}${filename}`;
        const destFile = `${destDir}${filename}`;

        try {
          const contents = await readFile(sourceFile, {
            encoding: "utf8",
          });
          const sourceObj = JSON.parse(contents);
          const destObj: JsonObject = {};

          try {
            keys.forEach((key) => {
              const deletedValue = deleteTerminalEntry(sourceObj, key);
              if (deletedValue === false) return;

              insertEntryFromDottedKeyString({
                obj: destObj,
                keyString: key,
                value: deletedValue,
              });

              // recursively iterate through parents, delete if empty
              const keys = key.split(".");
              for (let i = keys.length - 1; i > 0; i--) {
                const keyString = keys.slice(0, i).join(".");
                deleteTerminalEntry(sourceObj, keyString, true);
              }
            });
          } catch (err) {
            console.error(err);
            return;
          }

          await writeFile(sourceFile, JSON.stringify(sourceObj, null, 2));
          await writeFile(destFile, JSON.stringify(destObj, null, 2));
        } catch (err) {
          console.error(err);
        }
      });
    }
  );

program.parseAsync();
