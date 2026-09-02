import { BN } from "@coral-xyz/anchor";
import {
    PublicKey,
    Transaction,
    Keypair,
    Connection,
    clusterApiUrl,
    TransactionInstruction,
    SystemProgram,
    LAMPORTS_PER_SOL
  
  } from "@solana/web3.js";



export function integerToByteArrayWeb3(value: any,size: any){
    value = BigInt(value);
    size = Number(size);

    if(value < 0n){
        value = (2n ** BigInt(size)) + value;
    }

    return new BN(value.toString()).toArrayLike(Buffer, "le", size/8);
}
export function stringToByteArrayWeb3(str: string){
    return Buffer.from(str);
}

//Generates a PDA key from seeds, can passs pubkeys and strings
export function getPDAWeb3(seeds: any[] = [],programId: PublicKey){
    // Seeds can be a mixed array of publicKeys and strings
    //   Returns the public key of the PDA, and the bumps

    const _seeds: any[] = []; //Encode the human readable stuff
    seeds.map(seed => {
        if(Buffer.isBuffer(seed)){
            _seeds.push(seed);
        }else if(Array.isArray(seed)){
            //Integer
            // [value,size]

            _seeds.push(integerToByteArrayWeb3(seed[0],seed[1]))
        }else{
            switch(typeof seed){
                case "number":
                case "bigint":

                //TODO: 9 might be for u64 only, might be number of bytes
                    _seeds.push(new BN(seed.toString()).toArrayLike(Buffer, "le", 8));
                    break;
                case "string":
                    //It was a string
                    // _seeds.push(Buffer.from(seed));
                    _seeds.push(stringToByteArrayWeb3(seed));
                    break;
                default:
                    //Assume it was a key
                    _seeds.push(seed.toBuffer());
                    break;

            }
        }
    })
    
    const [thisPDA, bumps] = PublicKey.findProgramAddressSync(
        _seeds,
        programId,
    )

    return thisPDA;
    // return [thisPDA, bumps];
}
