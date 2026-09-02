require('dotenv').config();

const PRIVATE_KEY_LOCATION=process.env.PRIVATE_KEY_LOCATION;

import {readFileSync} from "fs";

import { createKeyPairSignerFromBytes } from "@solana/kit";

const _pk = readFileSync(String(PRIVATE_KEY_LOCATION),{ encoding: 'utf-8',  flag: 'r' });
const __pk = JSON.parse(_pk);
const pk = new Uint8Array(__pk);


export let keypair: any;
export let privateKey = pk;

export async function initKeypair(){
    keypair = await createKeyPairSignerFromBytes(pk);;
}