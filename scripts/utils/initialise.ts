require('dotenv').config();
import "console.colourise";
// let {
//     //@ts-ignore
//     log, red, black, green, yellow, blue, magenta, cyan, white,
// } = console;

import { keypair as feePayer, initKeypair } from "./walletKit";
import { inferNetwork } from "./network";

export async function initialise(){
    
    inferNetwork();
    await initKeypair();
}