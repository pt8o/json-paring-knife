#! /usr/bin/env node

import { program } from "commander";
import { readFile, writeFile } from "node:fs/promises";

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

      const filename = source.split("/").pop();
      const dest = destination.endsWith("/") ? destination : `${destination}/`;

      try {
        const contents = await readFile(source, { encoding: "utf8" });
        const json = JSON.parse(contents);
        const keys = commaSeparatedKeys.split(",");

        const entriesToMigrate: JsonObject = {};

        try {
          keys.forEach((key) => {
            const deletedValue = deleteTerminalEntry(json, key);
            if (deletedValue === false) return;

            insertEntryFromDottedKeyString({
              obj: entriesToMigrate,
              keyString: key,
              value: deletedValue,
            });

            // iterate through parent, delete parent if empty
            const keys = key.split(".");
            for (let i = keys.length - 1; i > 0; i--) {
              const keyString = keys.slice(0, i).join(".");
              deleteTerminalEntry(json, keyString, true);
            }
            console.log(JSON.stringify(json, null, 2));
          });
        } catch (err) {
          console.error(err);
        }

        await writeFile(source, JSON.stringify(json, null, 2));
        await writeFile(
          `${dest}${filename}`,
          JSON.stringify(entriesToMigrate, null, 2)
        );
      } catch (err) {
        console.error(err);
      }
    }
  );

program.parseAsync();
