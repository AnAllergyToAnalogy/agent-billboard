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
exports.initSolana = initSolana;
exports.getPastLogs = getPastLogs;
exports.getBillboardState = getBillboardState;
const kit_1 = require("@solana/kit");
const utils_1 = require("./svm/utils");
const client = __importStar(require("./config/billboard/src/generated"));
const solana_slam_1 = require("solana-slam");
const programId = (0, kit_1.address)(client.BILLBOARD_PROGRAM_ADDRESS);
let rpc;
let billboardAddress;
async function initSolana(provider_url) {
    rpc = (0, kit_1.createSolanaRpc)(provider_url);
    billboardAddress = await (0, utils_1.getPDA)(["billboard"], programId);
}
async function getPastLogs() {
    // return
    const pastLogs = [];
    // TODO: 
    // - query a chunk of events at the time, 
    // - look through them to see if they have acquire events
    // - add these to the pastLogs array (including timestamp)
    // Write this, update as needed
    const LIMIT = 200;
    let earliest = null;
    while (true) {
        let signaturesForConfig = {
            limit: LIMIT
        };
        if (earliest) {
            signaturesForConfig.before = earliest;
        }
        const signatures = await rpc.getSignaturesForAddress(programId, signaturesForConfig).send();
        const search = [
            `Program ${programId} invoke [1]`,
            'Program log: Instruction: Acquire',
            'Program data: '
        ];
        const searchString = search.join("\n");
        for (let sig of signatures) {
            let transaction = await rpc.getTransaction(sig.signature, {
                maxSupportedTransactionVersion: 1
            }).send();
            const logs = transaction.meta.logMessages.join("\n");
            if (logs.includes(searchString)) {
                try {
                    //catch any bad data
                    const blockTime = Number(transaction.blockTime * 1000n);
                    const data = (logs.split(searchString))[1].split("\n")[0];
                    const base64codec = (0, kit_1.getBase64Codec)();
                    const data_bytes = base64codec.encode(data);
                    const DISCRIMINATOR_LENGTH = 8;
                    const KEY_LENGTH = 32;
                    const AMOUNT_LENGTH = 8;
                    const poster_bytes = data_bytes.subarray(DISCRIMINATOR_LENGTH, DISCRIMINATOR_LENGTH + KEY_LENGTH);
                    const amount_bytes = data_bytes.subarray(DISCRIMINATOR_LENGTH + KEY_LENGTH, data_bytes.length);
                    const base58Codec = (0, kit_1.getBase58Codec)();
                    const u64codec = (0, kit_1.getU64Codec)();
                    const poster = base58Codec.decode(poster_bytes);
                    const amount = u64codec.decode(amount_bytes);
                    pastLogs.push({
                        timestamp: Number(blockTime),
                        poster: poster.toString(),
                        amount: String(amount),
                    });
                }
                catch (e) {
                    // Do nothing, ignore
                }
            }
        }
        let lastTx = signatures[signatures.length - 1];
        earliest = lastTx.signature;
        if (signatures.length < LIMIT) {
            break;
        }
    }
    return pastLogs;
}
async function readAccount(accountName, address) {
    const account = await (0, kit_1.fetchEncodedAccount)(rpc, address);
    if (account.exists) {
        const AccountName = (0, solana_slam_1.camelToPascal)(accountName);
        //@ts-ignore
        const codec = client[`get${AccountName}Codec`]();
        const values = codec.decode(account.data);
        return values;
    }
    else {
        throw new Error("Account doesn't exist");
    }
}
async function getBillboardState() {
    let data;
    try {
        data = await readAccount("billboard", billboardAddress);
    }
    catch (e) {
        console.log(e);
        return null;
    }
    let state = {
        creator: data.creator,
        amount: data.amount,
        message: data.message,
        poster: data.poster,
    };
    return state;
}
