import { address, Address, getProgramDerivedAddress } from "@solana/kit";
import * as kit from "@solana/kit";

import { pascalToCamel } from "./case";

export async function getPDA(seeds: any[], programId: Address){

    let seeds_parsed = [];
    for(let s = 0; s < seeds.length; s++){
        const seed = seeds[s];
        //@ts-ignore
        if(seed.buffer){
            //Assume it's already been encoded (including Address), just add to parsed
            seeds_parsed.push(seed);
        }else if(typeof seed === "string"){
            // Strings just go as is
            seeds_parsed.push(seed);
        }else if(Array.isArray(seed)){
            //@ts-ignore
            if(seed.length !== 2){
                //@ts-ignore
                throw new Error("Unexpected seed length as Array: "+seed.length);
            }
            const value = seed[0];
            const t = seed[1];
            if(!isNumberType(t)){
                throw new Error("Not a valid number type: "+t);
            }

            seeds_parsed.push(typeEncoder[t].encode(value));
            // if(!isIntegerType)
        }else{
            throw new Error("Unable to interpret seed: "+seed);
        }
    }

    const [pda, bump] = await getProgramDerivedAddress({
        programAddress: programId,
        //@ts-ignore
        seeds: seeds_parsed
    });
    return pda;
}


// Types
export function integerTypeToSize(type: string){
    return type.substring(1);
}
export function isIntegerType(type: string){
    const types = ["isize","usize"];
    for(let i = 0; i < 8; i++){
        const s = 8 * (2 ** i);
        types.push("u"+s);
        types.push("i"+s);
    }
    return types.includes(type);
}
export function isNumberType(type: string){
    const types = ["f32","f64"];
    return types.includes(type) || isIntegerType(type);
}

export const typeEncoder = (()=>{
    const types =  ["Address","F32","F64"];

    for(let i = 0; i < 5; i++){
        const s = 8 * (2 ** i);
        types.push("U"+s);
        types.push("I"+s);
    }

    // log(types);

    const e = {} as {[key: string]: any;};
    for(let T of types){
        const t = pascalToCamel(T);
        const functionName: string = `get${T}Encoder`;

        //@ts-ignore
        e[t] = kit[functionName]();
    }
    return e;
})();

export function addressToBytes(str: string){
    return typeEncoder.address.encode(str);
}