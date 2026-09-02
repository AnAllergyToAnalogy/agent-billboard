import { get, writable, type Writable } from "svelte/store";
import { browser } from "$app/environment";

import { initData, values, Data } from "./data/data";
import { siteData } from "./config/data";
initData(siteData);


let log = console.log;


// Import Program IDL and ProgramClient
import * as idl from "$lib/config/billboard.json";
import * as programClient from "$lib/config/billboard/src/generated";

import {
    addAccounts,
    clearAddedAccounts,
    createProgram,    getAddedAccounts,    getConnection,    init,
    isMe,
    onConnect,
    onDisconnect,
   
    onSubscriptionFail,
   
    onTransaction,
   
    signer,
    sleep,
    transact,
} from "kit-squared";
import { address, type Address } from "@solana/kit";
import { HUNDRED, MIN_PERCENT_INCREASE } from "./constants";
import { setRpcError } from "./rpcError";


// Use free RPCs
let http = "https://shared.eu-central-1.getblock.io/9e5457ea4bee4b1699543049d1cb4051";
// let http = "https://api.devnet.solana.com";
// let ws = "wss://api.devnet.solana.com";
let ws = "wss://shared.eu-central-1.getblock.io/6ff076300794446bad41bf4321bc6ff3";
const network = "devnet";

let program:  {[key: string]: any};
let billboardAccount: Address;




onSubscriptionFail((e)=>{
    setRpcError("Failed to subscribe to program");
    // log("subscription fail");
    // log(e);
})

function registerEvents(){

    program.on("acquired", async (eventData: any,slotNumber: bigint,signature: string)=>{
        console.log("acquired")
        const {poster, amount} = eventData;

        // Trigger reload
        await requestReloadData();
    });

    program.on("updated", async (eventData: any,slotNumber: bigint,signature: string)=>{
        console.log("updated")

        // Trigger reload
        await requestReloadData();
    });

}
function killOldProgram(){
    program.onEventDropout.killAll();
    program.killEvents();
    
}

let firstInit = true;
export let initialising = writable(false);
export async function reInitialise(_http: string, _ws: string){
    if(get(initialising)) return;
    initialising.set(true);
    if(!firstInit){
        uninitialise();
    }

    http = _http;
    ws = _ws;

    await initialise();
    initialising.set(false);
}

let killOnConnect: Function, killOnDisconnect: Function;
async function initialise(){
    
    init(http,ws,network);

    program = await createProgram(programClient,idl, signer);
    program.onEventDropout((programName: string)=>{
        //Event dropout
        setRpcError("Event dropout: "+programName);
    })

    billboardAccount = await program.pda(["billboard"]);

    registerEvents();

    killOnConnect = onConnect(async ()=>{
        console.log("wallet connected")

        killOldProgram();

        // Replace program helper with wallet-enabled version
        program = await createProgram(programClient,idl,signer);

        registerEvents();

    })
    killOnDisconnect = onDisconnect(async()=>{
        console.log("wallet disconnected")

        killOldProgram();

        program = await createProgram(programClient,idl);

        registerEvents();

    });


    onTransaction.fail((labels)=>{
        alert(`Transaction faied: ${labels.join(", ")}`);
    })


    await requestReloadData();

}

// Unsubscribe everything, put this in page unmount
export function uninitialise(){
    killOldProgram();
    killOnConnect();
    killOnDisconnect();
}

if(browser){
    reInitialise(http,ws);
}


// Reload All the Data
let reloadRequestId = 0n;
let lastFullfilledRequest = 0n;
let reloading = false;
let initialLoad = true;
async function requestReloadData(){
    reloadRequestId++;
    await reloadData();
}
async function _readBillboardAccount(){
    try{
        const data = await program.account.billboard(billboardAccount);
        // log(1)
        return data;
    }catch(e){
        // log(2)
        setRpcError("Error reading account");
        throw e;
    }
}
async function reloadData(){
    if(!program) return;
    if(reloading) return;
    reloading = true;


    let id = reloadRequestId;

    if(initialLoad){
        await Data.loadDatas([
            "creator",
            "poster",
            "amount",
            "message",
        ],async ()=>{

            const data = await _readBillboardAccount();
            

            lastFullfilledRequest = id;
            initialLoad = false;

            return {
                creator: data.creator.toString(),
                poster: data.poster.toString(),
                amount: BigInt(data.amount),
                message: data.message.toString(),
            }
        })

    }else{  
        // const data = await program.account.billboard(billboardAccount);
        const data = await _readBillboardAccount();
        lastFullfilledRequest = id;

        Data.safeUpdate("creator", data.creator.toString());
        Data.safeUpdate("poster", data.poster.toString());
        Data.safeUpdate("amount", BigInt(data.amount));
        Data.safeUpdate("message", data.message.toString());
    }


    await sleep(1000); // Lazy rate limit protection
    reloading = false;
    if (lastFullfilledRequest !== reloadRequestId){
        reloadData();
    }

}

///// Transactions

async function prepareForAcquire(){
  await addAccounts({
    prevPoster: address(Data.getData("poster")),
    creator:    address(Data.getData("creator")),
  })
}


export async function acquire(value: bigint = 0n){

    await clearAddedAccounts();

    if(!value){
        value = Data.getData("amount") * (HUNDRED + MIN_PERCENT_INCREASE) / HUNDRED;
    }

    await prepareForAcquire();


    await program.tx.acquire(value);
}
export async function append(message: string){

    await clearAddedAccounts();

    await program.tx.append(message);
}
export async function clear(){
    await clearAddedAccounts();

    await program.tx.clear();
}
export async function acquireAndAppend(value: bigint = 0n, message: string = ''){

    await clearAddedAccounts();

    if(!value){
        value = Data.getData("amount") * (HUNDRED + MIN_PERCENT_INCREASE) / HUNDRED;
    }
    await prepareForAcquire();

    const ixAcquire = await program.ix.acquire(value);

    await clearAddedAccounts();

    const ixAppend = await program.ix.append(message);

    // Send TX
    await transact([ixAcquire,ixAppend])

}
export async function clearAndAppend(message: string){

    await clearAddedAccounts();

    const ixClear = await program.ix.clear();
    const ixAppend = await program.ix.append(message);

    // Send TX
    await transact([ixClear,ixAppend])
}

