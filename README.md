# JSON Parsing Knife (jpk)

Simple CLI tool for parsing JSON files and migrating key-values to new files.

The intent of this tool is to move identical keys across multiple JSON files to a new folder, matching the original filenames. If those files already exist, the new keys should be merged into them.

## Requirements

- [x] list all terminal keys (i.e. recursive search) in a JSON file
- [ ] parse one JSON file and move the identified keys to new folder
- [ ] if deleted keys leave behind an empty entry in the source JSON, delete it
- [ ] parse entire folder and move identified keys to new folder
- [ ] if destination files exist, merge keys with existing, rather than overwriting
- [ ] use `inquirer` to interactively select keys within CLI
- [ ] tests
- [ ] use a packager so we can split/import functions