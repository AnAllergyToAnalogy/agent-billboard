import { appendTransactionMessageInstructions, createTransactionMessage, getSignatureFromTransaction, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, Signature, signTransactionMessageWithSigners } from "@solana/kit";
import { getConnectionKit } from "./connection";

import { keypair as feePayer,} from "./walletKit";

let log = console.log;

export async function transact(instructions: any[]): Promise<Signature>{

    const c = getConnectionKit();
    const rpc = c.rpc;
    const rpcSubscriptions = c.rpcSubscriptions;

    // Get latest blockhash to include in transaction
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    // Create transaction message
    const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }), // Create transaction message
        (tx) => setTransactionMessageFeePayerSigner(feePayer, tx), // Set fee payer
        (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx), // Set transaction blockhash
        (tx) => appendTransactionMessageInstructions(instructions, tx) // Append instructions
    );


    // Sign transaction message with required signers (fee payer and mint keypair)
    const signedTransaction =
        await signTransactionMessageWithSigners(transactionMessage);


    // Send and confirm transaction
    await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(
        //@ts-ignore
        signedTransaction,
        { commitment: "confirmed" }
    );

    // Get transaction signature
    const transactionSignature = getSignatureFromTransaction(signedTransaction);

    return transactionSignature;
    
}