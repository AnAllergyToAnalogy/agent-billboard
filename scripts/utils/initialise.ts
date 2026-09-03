require('dotenv').config();
import "console.colourise";

import { keypair as feePayer, initKeypair } from "./walletKit";
import { inferNetwork } from "./network";

export async function initialise(){
    
    inferNetwork();
    await initKeypair();
}