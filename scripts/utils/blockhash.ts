import { getConnectionKit } from "./connection";


export async function getLatestBlockhash(){
    return await getConnectionKit().rpc.getLatestBlockhash();
}