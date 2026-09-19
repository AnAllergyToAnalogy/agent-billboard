require('dotenv').config();

const {
    MAX_WRITE_INTERVAL_MS,
} = process.env;

import fs from "fs";

import util from "util";
const exec = util.promisify(require("child_process").exec);

let lastKnownState: null | any = null;
let lastWriteTime: number = 0;


export function checkGitReady(): boolean{
    return fs.existsSync(__dirname+"/output/.git");
}

export async function prepareStorageSync(): Promise<void>{
    // Stash and pull to prevent conflicts from redundant instances
    const result = await exec(`cd output; git stash; git pull`);
}

export async function updateStorage(
    pastLogs: any[],
    creator: string,
    poster: string,
    amount: bigint,
    message: string,
    verboseMode: boolean = false
): Promise<boolean>{


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

    if (hasNewData){
        if(verboseMode){
            console.log("Has new data..")
        }
        await prepareStorageSync()
        prepared = true;

        fs.writeFileSync(
            __dirname+"/output/history.json",
            pastLogsStringified,
            {
                encoding: "utf8"
            }
        )
    }


    const isPastWriteTime = (lastWriteTime + Number(MAX_WRITE_INTERVAL_MS) < Date.now()) ;


    // console.log("isPastWriteTime:",isPastWriteTime);
    // console.log("lastWriteTime:",lastWriteTime);
    // console.log("MAX_WRITE_INTERVAL_MS:",MAX_WRITE_INTERVAL_MS);
    // console.log("Date.now():",Date.now());

    if(hasNewData || isPastWriteTime ){
        //Difference found
        if(verboseMode){
            console.log("Writing.. IsPastWriteTime?",isPastWriteTime);
        }

        if(!prepared){
            await prepareStorageSync()
        }

        fs.writeFileSync(
            __dirname+"/output/billboard.json",
            stringifiedWithTimestamp,
            {
                encoding: "utf8"
            }
        )

        const commit_message = `state: ${(new Date()).toUTCString()}`;
        try{
            const result = await exec(`cd output; git add .; git commit -m  '${commit_message}'; git push`);
            // Wrote changes
        }catch(e){
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