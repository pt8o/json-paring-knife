"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertEntryFromDottedKeyString = exports.deleteTerminalEntry = exports.getTerminalKeys = void 0;
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
exports.getTerminalKeys = getTerminalKeys;
function deleteTerminalEntry(obj, keyString, onlyIfEmpty = false) {
    const startingKeys = keyString.split(".");
    const lastKey = startingKeys.pop();
    const lastObj = startingKeys.reduce((acc, key) => {
        // since we've popped the last key, we know that the final value here is an object
        return acc[key];
    }, obj);
    if (!lastKey || !lastObj[lastKey]) {
        throw new Error(`Did not find key "${keyString}"`);
    }
    if (onlyIfEmpty && Object.keys(lastObj[lastKey]).length > 0) {
        return false;
    }
    const lastValue = lastObj[lastKey];
    delete lastObj[lastKey];
    return lastValue;
}
exports.deleteTerminalEntry = deleteTerminalEntry;
function insertEntryFromDottedKeyString({ obj, keyString, value, }) {
    const keys = keyString.split(".");
    const lastKey = keys.pop();
    const lastObj = keys.reduce((acc, key) => {
        if (!acc[key]) {
            acc[key] = {};
        }
        return acc[key];
    }, obj);
    lastObj[lastKey] = value;
    return obj;
}
exports.insertEntryFromDottedKeyString = insertEntryFromDottedKeyString;
