#! /usr/bin/env node

import { program } from "commander";
import { readFile } from "node:fs/promises";

import { deleteTerminalEntry, getTerminalKeys } from "./utils";

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
  // .requiredOption(
  //   "-d, --destination <destination>",
  //   "destination folder to write"
  // )
  .requiredOption(
    "-k, --keys <keys>",
    "keys to delete (comma separated strings)"
  )
  .action(async (options: { source: string; keys: string }) => {
    const { source, keys: keysRaw } = options;

    try {
      const contents = await readFile(source, { encoding: "utf8" });
      const json = JSON.parse(contents);
      const keys = keysRaw.split(",");

      try {
        keys.forEach((key) => {
          // iterate through parent, delete parent if empty
          const keys = key.split(".");
          for (let i = keys.length - 1; i > 0; i--) {
            const keyString = keys.slice(0, i).join(".");
            deleteTerminalEntry(json, keyString, true);
          }

          console.log(JSON.stringify(json));
        });
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
    }
  });

program.parseAsync();
