import { Address } from "@solana/kit"

export type BillboardState = {
    creator: Address,
    poster: Address,
    amount: bigint,
    message: string
}
