import fs from "fs";

import util from "util";
const exec = util.promisify(require("child_process").exec);

let lastKnownState: null | any = null;


export function checkGitReady(): boolean{
    return fs.existsSync(__dirname+"/output/.git");
}

export async function updateStorage(
    poster: string,
    amount: bigint,
    message: string,
): Promise<boolean>{


    let amount_stirng = String(amount);


    // Created stringified state object
    const stringified = JSON.stringify({
        poster,
        amount: amount_stirng,
        message
    });



    if(stringified !== lastKnownState){
        //Difference found

        fs.writeFileSync(
            __dirname+"/output/billboard.json",
            stringified,
            {
                encoding: "utf8"
            }
        )

        const commit_message = `state: ${(new Date()).toUTCString()}`;
        const result = await exec(`cd output; git add .; git commit -m  '${commit_message}'; git push`);
        // Wrote changes

        lastKnownState = stringified;
        return true;
    }

    //No difference found, 
    // Did not write changes
    return false;
}