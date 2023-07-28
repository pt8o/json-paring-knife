import { JsonObject } from "./types";

export function getTerminalKeys(
  obj: JsonObject,
  accString = "",
  accArray: string[] = []
) {
  const keysArray: string[][] = Object.keys(obj).map((key) => {
    const keyString = accString ? `${accString}.${key}` : key;
    if (typeof obj[key] === "string") {
      return [keyString];
    }
    return getTerminalKeys(obj[key] as JsonObject, keyString, accArray);
  });
  return [...accArray, ...keysArray.flat()];
}

export function deleteTerminalEntry(
  obj: JsonObject,
  keyString: string,
  onlyIfEmpty = false
) {
  const startingKeys = keyString.split(".");
  const lastKey = startingKeys.pop()!;
  const lastObj = startingKeys.reduce((acc: JsonObject, key: string) => {
    // since we've popped the last key, we know that the final value here is an object
    return acc[key] as JsonObject;
  }, obj);

  if (!lastKey || !lastObj[lastKey]) {
    throw new Error(`Did not find key "${keyString}"`);
  }

  if (onlyIfEmpty && Object.keys(lastObj[lastKey]).length > 0) {
    return false;
  }
  const lastValue = lastObj[lastKey] as string;
  delete lastObj[lastKey];
  return lastValue;
}

export function insertEntryFromDottedKeyString({
  obj,
  keyString,
  value,
}: {
  obj: JsonObject;
  keyString: string;
  value: string;
}) {
  const keys = keyString.split(".");
  const lastKey = keys.pop()!;
  const lastObj = keys.reduce((acc: JsonObject, key: string) => {
    if (!acc[key]) {
      acc[key] = {};
    }
    return acc[key] as JsonObject;
  }, obj);

  lastObj[lastKey] = value;
  return obj;
}
