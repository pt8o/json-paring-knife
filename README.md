# JSON Paring Knife (jpk)

Simple CLI tool for paring entries out of JSON files and migrating them to new files.

The intent of this tool is to move identical keys that exist across multiple JSON files to a new folder, matching each of the original filenames. It was built for the use case of i18n strings being stored in per-language JSON files, e.g. in folder `Component/translations/` you have `en.json`, `fr.json`, `ko.json`... and want to delete certain entries in these files and copy them to new files in another folder `NewComponent/translations/`.

It assumes that all JSON files in a given folder have an identical shape; at the moment it does not (gracefully) handle other cases.

## Installation

The package is available from NPM under the name `json-paring-knife`.

```bash
npm install -g json-paring-knife
```

Alternatively, you can also clone this repo and run this from the repo root:

```bash
npm install -g
```

Check for a successful installation with `json-paring-knife -v`; it should print the package's version number.

## Usage

The script can be run with `json-paring-knife` or the shorthand `jpk`. All script arguments are available in verbose and shorthand equivalents (e.g. `--source` == `-s`).

### `list`

List all available keys from the JSON file passed in as `--source`.

```bash
jpk list --source ./Component/translations/en.json
```

If a folder is provided, it uses the first JSON file in the folder. Again, this is because it's expecting all JSON files in the folder to have the same shape.

```bash
jpk list -s ./Component/translations/
```

### `pare`

Pare selected `--keys` from `--source`, save to `--destination` folder.

If `--source` is a single file, it only pares that file.

```bash
jpk pare --source ./Component/translations/en.json --destination ./NewComponent/translations/ --keys keyOne,keyTwo.nestedKey.deepNestedKey,keyThree
```

If `--source` is a folder, it pares all JSON files in that folder.

```bash
jpk pare -s ./Component/translations/ -d ./NewComponent/translations/ -k keyOne,keyTwo.nestedKey.deepNestedKey,keyThree
```

### Example

Starting with these files:

```json
// Component/translations/en.json
{
  "1": "one",
  "2": {
    "a": "two aye",
    "b": "two bee"
  },
  "3": {
    "a": {
      "i": "three aye one",
      "ii": "three aye two"
    },
    "b": "three bee"
  },
  "4": "four",
  "5": {
    "a": "five aye"
  }
}

// Component/translations/fr.json
{
  "1": "un",
  "2": {
    "a": "deux ah",
    "b": "deux bay"
  },
  "3": {
    "a": {
      "i": "trois ah un",
      "ii": "trois ah deux"
    },
    "b": "trois bay"
  },
  "4": "quatre",
  "5": {
    "a": "cinq ah"
  }
}
```

Get a list of the keys you can select:

```bash
jpk list -s ./Component/translations/en.json

# Result
All keys in the file ./Component/translations/en.json:
  1
  2.a
  2.b
  3.a.i
  3.a.ii
  3.b
  4
  5.a
```

Pare the keys `3.a` and `4` from source folder `./Component/translations/`, move to destination folder `./NewComponent/translations/`:

```bash
jpk pare -s ./Component/translations/ -d ./NewComponent/translations/ -k 3.a,4

```

Resulting original files:

```json
// ./Component/translations/en.json
{
  "1": "one",
  "2": {
    "a": "two aye",
    "b": "two bee"
  },
  "3": {
    "b": "three bee"
  },
  "5": {
    "a": "five aye"
  }
}

// ./Component/translations/fr.json
{
  "1": "un",
  "2": {
    "a": "deux ah",
    "b": "deux bay"
  },
  "3": {
    "b": "trois bay"
  },
  "5": {
    "a": "cinq ah"
  }
}
```

Resulting new files:

```json
// ./NewComponent/translations/en.json
{
  "3": {
    "a": {
      "i": "three aye one",
      "ii": "three aye two"
    }
  },
  "4": "four"
}

// ./NewComponent/translations/fr.json
{
  "3": {
    "a": {
      "i": "trois ah un",
      "ii": "trois ah deux"
    }
  },
  "4": "quatre"
}
```
