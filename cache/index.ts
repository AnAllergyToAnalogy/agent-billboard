import { readArgs } from "./readArgs";
import { getBillboardState, getPastLogs, initSolana } from "./solana";
import { checkGitReady, updateStorage } from "./storage";

require('dotenv').config();

const {
    RPC_URL,
    RECHECK_INTERVAL_MS,
    SUCCESS_WAIT_INTERVAL_MS,
    FAIL_WAIT_INTERVAL_MS,
    MAX_WRITE_INTERVAL_MS,
} = process.env;

let log = console.log;
function die(msg: string|null = null){
    if(msg){
        console.log(msg);
    }
    process.exit();
}

function checkEnv(props: Array<string>){
    for(let prop of props){
        if (!Object.keys(process.env).includes(prop)){
            die(`${prop} not provided`);
        }
    }
}

log();
log("== Billboard Cache == ")
log();
 
async function sleep(duration_ms: any){
    const _duration = Number(duration_ms);
    return new Promise((resolve)=>{
       setTimeout(resolve, _duration);
    });
}

let verboseMode = false;
let pastLogs: any[] = [];
function maybeUpdateLogs(data: any){
    if(pastLogs.length && pastLogs[0].amount < data.amount){
        pastLogs.unshift({
            poster: data.poster.toString(),
            amount: String(data.amount),
            timestamp: Date.now(),
        })
    }
}

async function initialise(){

    const {verbose} = readArgs([],[],["verbose"],false);
    verboseMode = verbose === "true";


    checkEnv([
        "RPC_URL",
        "RECHECK_INTERVAL_MS",
        "SUCCESS_WAIT_INTERVAL_MS",
        "FAIL_WAIT_INTERVAL_MS",
        "MAX_WRITE_INTERVAL_MS"
    ]);

    if(!checkGitReady()){
        die("Output directory git not ready.");        
    }

    

    await initSolana(String(RPC_URL));

    pastLogs = await getPastLogs();
    // log(pastLogs)
    // log("debug exit")
    // return;

    log("Start main loop...")
   
    main()
}

let failedRecently = false;
async function main(){

    if(failedRecently){
        log("Retrying...");
        failedRecently = false;
    }
    if(verboseMode){
        log(new Date());
    }

    const state = await getBillboardState();


    

    if(state){

        maybeUpdateLogs(state);

        const changed = await updateStorage(
            pastLogs,
            state.creator.toString(),
            state.poster.toString(),
            state.amount,
            state.message
        )

        if(changed){
            log()
            log("--------------------------------")
            log("---     Updated storage.     ---")
            log("--------------------------------")

            log();
            log("Creator:",state.creator);
            log("Poster:",state.poster);
            log("Amount:",state.amount);
            log("Message:",state.message);
            log();

            await sleep(SUCCESS_WAIT_INTERVAL_MS);
        }


    }else{
        log("Failed.");

        failedRecently = true;
        await sleep(FAIL_WAIT_INTERVAL_MS);
    }

    setTimeout(main, Number(RECHECK_INTERVAL_MS));

}

initialise();