import { log } from "node:console";
import { getConnectionKit } from "../utils/connection";
import { address } from "@solana/kit";
import { fetchToken, findAssociatedTokenPda } from "@solana-program/token";

export async function getTokenAccount(
    mintAddress: string,
    owner: string,
    tokenProgramAddress: string
): Promise<string | null>{

    const [associatedTokenAddress] = await findAssociatedTokenPda({
        mint: address(mintAddress),
        owner: address(owner),
        tokenProgram: address(tokenProgramAddress),
    });

    // Get Connection 
    const c = getConnectionKit();
    const rpc = c.rpc;

    try{
        const ataDetails = await fetchToken(rpc, associatedTokenAddress);
        return associatedTokenAddress;
    }catch(e){
        return null;
    }

}
