import { setNetwork } from "./connection";

require('dotenv').config();

const NETWORK=process.env.NETWORK;


export function inferNetwork(){
    //@ts-ignore
    setNetwork(NETWORK);
}
