"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGitReady = checkGitReady;
exports.prepareStorageSync = prepareStorageSync;
exports.updateStorage = updateStorage;
require('dotenv').config();
const { MAX_WRITE_INTERVAL_MS, } = process.env;
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const exec = util_1.default.promisify(require("child_process").exec);
let lastKnownState = null;
let lastWriteTime = 0;
function checkGitReady() {
    return fs_1.default.existsSync(__dirname + "/output/.git");
}
async function prepareStorageSync() {
    // Stash and pull to prevent conflicts from redundant instances
    const result = await exec(`cd output; git stash; git pull`);
}
async function updateStorage(pastLogs, creator, poster, amount, message) {
    let amount_stirng = String(amount);
    let pastLogsStringified = JSON.stringify(pastLogs);
    // Created stringified state object
    const stringified = JSON.stringify({
        creator,
        poster,
        amount: amount_stirng,
        message
    });
    const stringifiedWithTimestamp = JSON.stringify({
        creator,
        poster,
        amount: amount_stirng,
        message,
        timestamp: Date.now(),
    });
    let hasNewData = stringified !== lastKnownState;
    let prepared = false;
    if (hasNewData) {
        await prepareStorageSync();
        prepared = true;
        fs_1.default.writeFileSync(__dirname + "/output/history.json", pastLogsStringified, {
            encoding: "utf8"
        });
    }
    const isPastWriteTime = (lastWriteTime + Number(MAX_WRITE_INTERVAL_MS) < Date.now());
    // console.log("isPastWriteTime:",isPastWriteTime);
    // console.log("lastWriteTime:",lastWriteTime);
    // console.log("MAX_WRITE_INTERVAL_MS:",MAX_WRITE_INTERVAL_MS);
    // console.log("Date.now():",Date.now());
    if (hasNewData || isPastWriteTime) {
        //Difference found
        if (!prepared) {
            await prepareStorageSync();
        }
        fs_1.default.writeFileSync(__dirname + "/output/billboard.json", stringifiedWithTimestamp, {
            encoding: "utf8"
        });
        const commit_message = `state: ${(new Date()).toUTCString()}`;
        try {
            const result = await exec(`cd output; git add .; git commit -m  '${commit_message}'; git push`);
            // Wrote changes
        }
        catch (e) {
            return false;
        }
        lastKnownState = stringified;
        lastWriteTime = Date.now();
        return hasNewData;
    }
    //No difference found, 
    // Did not write changes
    return false;
}
