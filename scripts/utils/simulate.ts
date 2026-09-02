import { appendTransactionMessageInstructions, assertIsTransactionMessageWithSingleSendingSigner, createSignableMessage, createTransactionMessage, getBase64EncodedWireTransaction, Instruction, partiallySignTransactionMessageWithSigners, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, TransactionSendingSigner } from "@solana/kit";
import { getConnectionKit } from "./connection";


import {
     initKeypair, keypair } from "./walletKit";
import { pipe } from "codama";


let log = console.log;

export async function simulate(ixs: Instruction[] = []){
    const connection = getConnectionKit();
    const rpc = connection.rpc;

    let simulateTxConfig = {
        commitment: "finalized",
        encoding: "base64",
        replaceRecentBlockhash: true,
        sigVerify: false,
        minContextSlot: undefined,
        innerInstructions: undefined,
        accounts: undefined
    };




    const feePayer = keypair as TransactionSendingSigner;

        
    // Set up an abort controller.
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send({ abortSignal });

    const transactionMessage = pipe(
                createTransactionMessage({ version: 0 }),
                (message) => setTransactionMessageFeePayerSigner(feePayer, message),
                (message) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, message),
                (message) => appendTransactionMessageInstructions(ixs, message)
    );
    
    const partiallySigned = await partiallySignTransactionMessageWithSigners(transactionMessage);

    const base64EncodedWireTransaction = getBase64EncodedWireTransaction(partiallySigned);



    let simulateResult = await rpc
        //@ts-ignore
        .simulateTransaction(base64EncodedWireTransaction, simulateTxConfig)
        .send();

    console.log(simulateResult);

}