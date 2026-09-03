import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { solanaRpc } from '@solana/kit-plugin-rpc';



const RPC_URLS: {[key:string]: string} = {
    localhost:  "http://127.0.0.1:8899",
    devnet:     "https://api.devnet.solana.com",
    testnet:    "https://api.testnet.solana.com",
    mainnet:    "https://api.mainnet-beta.solana.com",
}

const WS_URLS: {[key:string]: string} = {
    localhost:  "ws://127.0.0.1:8899",
    devnet:     "wss://api.devnet.solana.com",
    testnet:    "wss://api.testnet.solana.com",
    mainnet:    "wss://api.mainnet-beta.solana.com",
}

let network = RPC_URLS.devnet;
let networkName = "devnet";


export function setNetwork(label: string){
    networkName = label;

    if(label === "env"){
        network = String(process.env.RPC_HTTP);
    }else{
        network = RPC_URLS[label];
    }

}
export function getNetworkName(){
    return networkName;
}

export function getConnectionKit(){
    return {
        rpc:                createSolanaRpc(RPC_URLS[networkName]),
        rpcSubscriptions:   createSolanaRpcSubscriptions(WS_URLS[networkName]),
        solanaRpc:  
            solanaRpc({
                rpcUrl: RPC_URLS[networkName],
                rpcSubscriptionsUrl: WS_URLS[networkName]
            })
    }
}