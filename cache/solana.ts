import { address, Address, createSolanaRpc, fetchEncodedAccount } from "@solana/kit";
import { getPDA } from "./svm/utils";

import * as client from "./config/billboard/src/generated";
import { camelToPascal } from "solana-slam";
import { BillboardState } from "./types";

const programId = address(client.BILLBOARD_PROGRAM_ADDRESS);

let rpc: any;
let billboardAddress: Address;



export async function initSolana(provider_url: string){

    rpc = createSolanaRpc(provider_url);
    billboardAddress = await getPDA(["billboard"],programId);
    
}



async function readAccount(accountName: string,address: Address){
    const account = await fetchEncodedAccount(rpc, address);
    if(account.exists){
        const AccountName = camelToPascal(accountName);
        //@ts-ignore
        const codec = client[`get${AccountName}Codec`]();
        const values = codec.decode(account.data);
        // for(let v in values){
        //     if(typeof values[v] === "number"){
        //         values[v] =  String(values[v]);
        //     }
        // }
        return values;
    }else{
        throw new Error("Account doesn't exist");
    }
}

export async function getBillboardState(){
    
    let data;
    try{
        data = await readAccount("billboard", billboardAddress);
    }catch(e){
        console.log(e);
        return null;
    }

    let state: BillboardState = {
        creator: data.creator,
        amount: data.amount,
        message: data.message,
        poster: data.poster,

    }

    return state;
}