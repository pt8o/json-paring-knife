# Requirements

- [x] list all terminal keys (i.e. recursive search) in a JSON file
- [x] parse one JSON file and move the identified keys to new folder
- [x] if deleted keys leave behind an empty entry in the source JSON, delete it
- [x] parse entire folder and move identified keys to new folder

## Stretch goals

- [ ] make `-i, --interactive` mode with `inquirer`
- [ ] tests
- [x] use a packager so we can split/import functions, use TS
- [ ] allow user to `reroot` keys (i.e. not migrate unnecessary nesting)
- [ ] if destination files exist, merge keys with existing, rather than overwriting
