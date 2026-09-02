import { initialise } from "./utils/initialise";


import { Address, address, fetchEncodedAccount } from "@solana/kit";

import * as client from "./program/billboard/src/generated";
const programId = address(client.BILLBOARD_PROGRAM_ADDRESS);


import { keypair } from "./utils/walletKit";
import { transact } from "./utils/transaction";
import { getPDA } from "./utils/utils";
import { getConnectionKit } from "./utils/connection";
import { camelToPascal } from "solana-slam";

//@ts-ignore
const {log, yellow, magenta,green} = console;


async function readAccount(accountName: string,address: Address){

        const account = await fetchEncodedAccount(getConnectionKit().rpc, address);
        if(account.exists){
            const AccountName = camelToPascal(accountName);
            //@ts-ignore
            const codec = client[`get${AccountName}Codec`]();
            const values = codec.decode(account.data);
            for(let v in values){
                if(typeof values[v] === "number"){
                    values[v] =  String(values[v]);// BigInt(values[v]);
                }
            }
            return values;
        }else{
            return null;
        }

    }



async function main(){
    yellow("== ACQUIRE ==");
    log("From .env")

    await initialise();

    const billboard = await getPDA(["billboard"],programId);
    const state = await readAccount("billboard",billboard);

    let amount;
    if(state.amount){
        amount = state.amount * 101n/100n;
    }else{
        amount = 1_000_000n;
    }


    const signer = keypair.address;

    const input: client.AcquireInput = {
        billboard,
        signer,
        prevPoster: address(state.poster),
        creator:    address(state.creator),
        amount
    }

    const acquireIx = client.getAcquireInstruction(input);

    magenta("transact...")
    const sig = await transact([acquireIx]);
    log("Sig:",sig);

    green("   done.")
}
main();