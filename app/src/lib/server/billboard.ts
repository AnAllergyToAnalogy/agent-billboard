import { createSolanaRpc, getProgramDerivedAddress } from "@solana/kit";
import { env } from "$env/dynamic/private";

import { BILLBOARD_PROGRAM_ADDRESS, fetchBillboard } from "$lib/config/billboard/src/generated";
import { HUNDRED, MIN_PERCENT_INCREASE } from "$lib/constants";
import { rpcs } from "$lib/rpcs";

export type BillboardState = {
    program: string;
    account: string;
    creator: string;
    poster: string;
    amount: string;
    minimumAmount: string;
    message: string;
};

export async function readBillboard(): Promise<BillboardState> {
    const rpc = createSolanaRpc(env.RPC_HTTP || rpcs[0].http);
    const [account] = await getProgramDerivedAddress({
        programAddress: BILLBOARD_PROGRAM_ADDRESS,
        seeds: ["billboard"]
    });
    const { data } = await fetchBillboard(rpc, account, { abortSignal: AbortSignal.timeout(5_000) });

    return {
        program: BILLBOARD_PROGRAM_ADDRESS,
        account,
        creator: data.creator,
        poster: data.poster,
        amount: data.amount.toString(),
        minimumAmount: (data.amount * (HUNDRED + MIN_PERCENT_INCREASE) / HUNDRED).toString(),
        message: data.message
    };
}
