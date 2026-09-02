import { initialise } from "./utils/initialise";


import { address } from "@solana/kit";

import * as client from "./program/billboard/src/generated";
const programId = address(client.BILLBOARD_PROGRAM_ADDRESS);


import { keypair } from "./utils/walletKit";
import { transact } from "./utils/transaction";
import { getPDA } from "./utils/utils";

//@ts-ignore
const {log, yellow, magenta,green} = console;


async function main(){
    yellow("== INITIALISE PROGRAM ==");
    log("From .env")

    await initialise();

    const billboard = await getPDA(["billboard"],programId);

    const signer = keypair.address;

    const initialPoster = address("11111111111111111111111111111112");

    const input: client.InitialiseInput = {
        billboard,
        signer,
        initialPoster
    }

    const initialiseIx = client.getInitialiseInstruction(input);

    magenta("transact...")
    const sig = await transact([initialiseIx]);
    log("Sig:",sig);

    green("   done.")
}
main();