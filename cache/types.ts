import { Address } from "@solana/kit"

export type BillboardState = {
    poster: Address,
    amount: bigint,
    message: string
}
