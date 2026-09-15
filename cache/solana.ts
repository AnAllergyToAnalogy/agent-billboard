import { address, Address, createSolanaRpc, fetchEncodedAccount, getBase58Codec, getBase64Codec, getBase64Decoder, getU64Codec, Signature } from "@solana/kit";
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


export async function getPastLogs(): Promise<any[]>{


    // return
    const pastLogs = [];

    // TODO: 
    // - query a chunk of events at the time, 
    // - look through them to see if they have acquire events
    // - add these to the pastLogs array (including timestamp)

    // Write this, update as needed

    const LIMIT = 200;
    let earliest = null;
    while(true){

        let signaturesForConfig: any = {
            limit: LIMIT
        };
        if(earliest){
            signaturesForConfig.before = earliest;
        }

        const signatures = await rpc.getSignaturesForAddress(programId, signaturesForConfig).send();

        const search = [
            `Program ${programId} invoke [1]`,
            'Program log: Instruction: Acquire',
            'Program data: '
        ]
        const searchString = search.join("\n");


        for(let sig of signatures){
            let transaction = await rpc.getTransaction(sig.signature as Signature,{
                maxSupportedTransactionVersion: 1
            }).send();

            const logs = transaction.meta.logMessages.join("\n");

            if(logs.includes(searchString)){

                try{
                    //catch any bad data

                    const blockTime = Number(transaction.blockTime * 1000n) 

                    const data = (logs.split(searchString))[1].split("\n")[0];

                    const base64codec = getBase64Codec();

                    const data_bytes = base64codec.encode(data);

                    const DISCRIMINATOR_LENGTH = 8;
                    const KEY_LENGTH = 32;
                    const AMOUNT_LENGTH = 8;
                    const poster_bytes = data_bytes.subarray(DISCRIMINATOR_LENGTH,DISCRIMINATOR_LENGTH + KEY_LENGTH);
                    const amount_bytes = data_bytes.subarray(
                        DISCRIMINATOR_LENGTH + KEY_LENGTH, 
                        data_bytes.length
                    );

                    const base58Codec = getBase58Codec();
                    const u64codec = getU64Codec();

                    const poster = base58Codec.decode(poster_bytes);

                    const amount = u64codec.decode(amount_bytes);

                    pastLogs.push({
                        timestamp: Number(blockTime),
                        poster: poster.toString(),
                        amount: String(amount),
                    })
                }catch(e){
                    // Do nothing, ignore
                }                
            }
        }

        let lastTx = signatures[signatures.length - 1];
        earliest = lastTx.signature;
 
        if(signatures.length < LIMIT){
            break;
        }

     }

    return pastLogs;
}

async function readAccount(accountName: string,address: Address){
    const account = await fetchEncodedAccount(rpc, address);
    if(account.exists){
        const AccountName = camelToPascal(accountName);
        //@ts-ignore
        const codec = client[`get${AccountName}Codec`]();
        const values = codec.decode(account.data);
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