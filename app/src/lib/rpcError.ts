import { writable, type Writable } from "svelte/store";

export const rpcHasError = writable(false);
export const rpcError: Writable<null|string> = writable(null);

export function setRpcError(message: string){
    rpcHasError.set(true);
    rpcError.set(message);
}

export function clearRpcError(){
    rpcHasError.set(false);
    rpcError.set(null);
}