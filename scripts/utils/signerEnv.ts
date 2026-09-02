import { createKeyPairFromBytes } from "@solana/kit";

export function readSignerEnv(): Uint8Array{
    return Uint8Array.from(JSON.parse(String(process.env.SIGNER_PRIVATE_KEY)));
}
export async function getPublicKeyFromSigner(privateKey: Uint8Array){
    const pubKey = (await createKeyPairFromBytes(privateKey)).publicKey
    //@ts-ignore
     return  new Uint8Array(await crypto.subtle.exportKey('raw', pubKey));
}