#! /usr/bin/env node

import { program } from "commander";
import { readFile, writeFile, readdir } from "node:fs/promises";

import {
  deleteTerminalEntry,
  getTerminalKeys,
  insertEntryFromDottedKeyString,
} from "./utils";
import { JsonObject } from "./types";

program
  .command("list")
  .description("list all the keys in the file")
  .requiredOption("-s, --source <source>", "source file to read")
  .action(async (options) => {
    const { source } = options;
    try {
      const contents = await readFile(source, { encoding: "utf8" });
      const json = JSON.parse(contents);
      const allKeys = getTerminalKeys(json);
      console.log("All keys in the file:");
      console.log(`  ${allKeys.join("\n  ")}`);
    } catch (err) {
      console.error(err);
    }
  });

program
  .command("pare")
  .description("delete --keys from --source file, save in --destination folder")
  .requiredOption("-s, --source <source>", "source file to read")
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

      const sourceArray = source.split("/");
      sourceArray.pop();
      const sourceDir = `${sourceArray.join("/")}/`;
      const destDir = destination.endsWith("/")
        ? destination
        : `${destination}/`;

      const files = (await readdir(sourceDir)).filter((file) =>
        file.endsWith(".json")
      );

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
