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
    creator: string,
    poster: string,
    amount: bigint,
    message: string,
): Promise<boolean>{


    let amount_stirng = String(amount);


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



    if(hasNewData || (lastWriteTime + Number(MAX_WRITE_INTERVAL_MS) < Date.now())  ){
        //Difference found

        await prepareStorageSync()

        fs.writeFileSync(
            __dirname+"/output/billboard.json",
            stringifiedWithTimestamp,
            {
                encoding: "utf8"
            }
        )

        const commit_message = `state: ${(new Date()).toUTCString()}`;
        const result = await exec(`cd output; git add .; git commit -m  '${commit_message}'; git push`);
        // Wrote changes

        lastKnownState = stringified;
        lastWriteTime = Date.now();
        return hasNewData;
    }

    //No difference found, 
    // Did not write changes
    return false;
}