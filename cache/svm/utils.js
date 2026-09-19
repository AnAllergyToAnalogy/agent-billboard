"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeEncoder = void 0;
exports.getPDA = getPDA;
exports.integerTypeToSize = integerTypeToSize;
exports.isIntegerType = isIntegerType;
exports.isNumberType = isNumberType;
exports.addressToBytes = addressToBytes;
const kit_1 = require("@solana/kit");
const kit = __importStar(require("@solana/kit"));
const case_1 = require("./case");
async function getPDA(seeds, programId) {
    let seeds_parsed = [];
    for (let s = 0; s < seeds.length; s++) {
        const seed = seeds[s];
        //@ts-ignore
        if (seed.buffer) {
            //Assume it's already been encoded (including Address), just add to parsed
            seeds_parsed.push(seed);
        }
        else if (typeof seed === "string") {
            // Strings just go as is
            seeds_parsed.push(seed);
        }
        else if (Array.isArray(seed)) {
            //@ts-ignore
            if (seed.length !== 2) {
                //@ts-ignore
                throw new Error("Unexpected seed length as Array: " + seed.length);
            }
            const value = seed[0];
            const t = seed[1];
            if (!isNumberType(t)) {
                throw new Error("Not a valid number type: " + t);
            }
            seeds_parsed.push(exports.typeEncoder[t].encode(value));
            // if(!isIntegerType)
        }
        else {
            throw new Error("Unable to interpret seed: " + seed);
        }
    }
    const [pda, bump] = await (0, kit_1.getProgramDerivedAddress)({
        programAddress: programId,
        //@ts-ignore
        seeds: seeds_parsed
    });
    return pda;
}
// Types
function integerTypeToSize(type) {
    return type.substring(1);
}
function isIntegerType(type) {
    const types = ["isize", "usize"];
    for (let i = 0; i < 8; i++) {
        const s = 8 * (2 ** i);
        types.push("u" + s);
        types.push("i" + s);
    }
    return types.includes(type);
}
function isNumberType(type) {
    const types = ["f32", "f64"];
    return types.includes(type) || isIntegerType(type);
}
exports.typeEncoder = (() => {
    const types = ["Address", "F32", "F64"];
    for (let i = 0; i < 5; i++) {
        const s = 8 * (2 ** i);
        types.push("U" + s);
        types.push("I" + s);
    }
    // log(types);
    const e = {};
    for (let T of types) {
        const t = (0, case_1.pascalToCamel)(T);
        const functionName = `get${T}Encoder`;
        //@ts-ignore
        e[t] = kit[functionName]();
    }
    return e;
})();
function addressToBytes(str) {
    return exports.typeEncoder.address.encode(str);
}
