const {addAccounts, assertValues, clearAddedAccounts, createProgram, fails, failsCorrectly, failsWithCode, generateSignerKeypairs, getSigner, initEnvironment, isSameKey, RBInt, setSigner, succeeds, getBalance,} = require("solana-slam");
import { createNewClient } from "../svmClient";

import {
    Keypair,
    PublicKey,
} from "@solana/web3.js";

import {Instruction } from "@coral-xyz/anchor";



// const ZERO_ADDRESS = "11...todo";
const ZERO_ADDRESS = new PublicKey(0);
console.log(ZERO_ADDRESS)

const HUNDRED = 100_00n;
const MIN_PERCENT_INCREASE = 1_00n;
const PERCENT_PROTOCOL = 50_00n;
const MESSAGE_SIZE = 1024n * 4n;
const TX_MESSAGE_SIZE_LIMIT = 940n;
// const TX_MESSAGE_SIZE_LIMIT = 100n;


const ERROR_SIZE = "Maximum message length is 4096 bytes.";
const ERROR_AMOUNT = "Amount is too low. Must be at least 1% higher than previous amount.";
const ERROR_ACCOUNT = "Duplicate account provided.";


// Import IDL and program types
import { Billboard } from "../target/types/billboard";
import { assert } from "chai";
import { integerToByteArray as integerToByteArray_slam, RArray, stringToByteArray, todo, getCurrentTime, createTokenInterface, assertDifferences, advanceSeconds, assertDifference, getAddedAccounts, getClient } from "solana-slam";
import { BN } from "bn.js";
const IDL = require("../target/idl/billboard.json");

let log = console.log;
let die = process.exit;


type Helper = {
  [key: string]: Function | { [key: string]: Function } | string | { [key: string]: Instruction } | any
}


let program: Helper;
let g: Helper;

// Create signer keypairs
const signers: Keypair[] = generateSignerKeypairs(9);
const [
  creator, 
  nonCreator, 
  poster0,
  poster1,
  poster2,
  poster3,
  poster4,
  nonPoster,
  initialPoster,
] = signers;

// PDA
let billboardAccount: PublicKey;


// Account Helpers
async function B(){
  const data = await program.account.billboard(billboardAccount);


  //TODO parse?

  // for(let i = 0; i < data.umpire.length; i++){
  //   data.umpire[i] = BigInt(data.umpire[i]);
  // }
  return data;
}


function integerToByteArray(value: any,size: any): Buffer{
    // converts given value and size (in bits) into byte array
    
    value = BigInt(value);
    size = Number(size);

    if(value < 0n){
        value = (2n ** BigInt(size)) + value;
    }

    return new BN(value.toString()).toArrayLike(Buffer, "le", size/8);
}


async function post(message: string, amount: bigint = 0n){
  const b = await B();
  if(!amount){
    amount = b.amount * (MIN_PERCENT_INCREASE + HUNDRED) / HUNDRED;
  }

  await prepareForPost();

  await g.post(message, amount);
}

async function acquire(amount: bigint = 0n){
  const b = await B();
  if(!amount){
    amount = b.amount * (MIN_PERCENT_INCREASE + HUNDRED) / HUNDRED;
  }

  await prepareForAcquire();

  await g.acquire(amount);
}

async function append(message:string = ""){
  await g.append(message);
  getClient().expireBlockhash();
}



async function initTests(){

}
async function refreshTestState(){
      // Re-initialise the client object
    const client = createNewClient();

    // Init the SLAM environment
    initEnvironment(client, signers );

    // Initalise the program helper

    g =
    //@ts-ignore
    program = createProgram<Billboard>(IDL);

    billboardAccount = g.pda(["billboard"]);
    
    // Set current signer to signer0
    setSigner(creator);

    //Clear any added accouts from previous tests
    clearAddedAccounts();

};



async function prepareForPost(){

  const b = await B();

  addAccounts({
    prevPoster: b.poster,
    creator:    b.creator,
  })
}
async function prepareForAcquire(){

  const b = await B();

  addAccounts({
    prevPoster: b.poster,
    creator:    b.creator,
  })
}





describe("Billboard", ()=>{

  before(initTests);
  beforeEach(async()=>{
    // log("billboard before each")
    // account = creator;
    await refreshTestState();
  });

  describe("initialise", ()=>{
    it("Can initialise", async()=>{
        await succeeds(async()=>{
          await g.initialise(initialPoster.publicKey);
        },true);
    });
    it("Creates billboard account and sets vars correctly", async()=>{
        const before = await B();

        await g.initialise(initialPoster.publicKey);

        const after = await B();

        assert.isNull(before, "before");
        assert.isNotNull(after,"after:null");

        assert.isTrue( isSameKey(after.creator, getSigner().publicKey),"creator");
        assert.isTrue( isSameKey(after.poster, initialPoster.publicKey),"poster");
        assert.equal(after.amount,0n,"amount");

        assert.equal(after.message,"");

    });
    describe("Can't initialise if",()=>{
        it("already initialised", async()=>{
            await g.initialise(initialPoster.publicKey);

            await fails(async()=>{
              await g.initialise(initialPoster.publicKey);
            });
        });
        
        it("intial potser is same as creator", async()=>{
            await failsCorrectly(async()=>{
              await g.initialise(creator.publicKey);
            },ERROR_ACCOUNT);
        });


    });
  });

  
  describe("functionality", async()=>{

    beforeEach(async()=>{
      // log("functionality: before each")
        setSigner(creator);
        await g.initialise(initialPoster.publicKey);
    })

    describe("update_creator",()=>{
        it("Can update creator",async()=>{
          await succeeds(async()=>{
              await g.updateCreator(nonCreator.publicKey);
          },true);
        });
        describe("Can't update creator",()=>{
        it("if not creator",async()=>{
            setSigner(nonCreator);

            await failsWithCode(async()=>{
            await g.updateCreator(nonCreator.publicKey);
            },"0x7dc");
        });
        })

        it("updates creator",async()=>{
        const before = await B();


        const newCreator = nonCreator.publicKey;
        await g.updateCreator(newCreator);

        const after = await B();

        assert.isFalse(isSameKey(after.creator, before.creator), "not equal");
        assert.isTrue(isSameKey(after.creator, newCreator), "equal");

        });
    })

    describe("usage", ()=>{

      const AMOUNT_0 = 1_000_000n;
      const AMOUNT_1 = 1_500_000n;

      const MESSAGE_0 = "AABBCCDD01234f";
      const MESSAGE_1 = "BANANA";


      beforeEach(async()=>{
        // log("usage before each")

        setSigner(poster0);
      })


      describe("acquire", ()=>{
        it("Can acquire", async()=>{
            await prepareForAcquire();

            await succeeds(async()=>{
                await g.acquire(AMOUNT_0);
            },true);
        });
        it("Can acquire if you were previous acquirer", async()=>{
            await acquire(AMOUNT_0);

            await succeeds(async()=>{
              await acquire(AMOUNT_1);
            })
        });

        describe("Updates vars correctly", async()=>{
          it("initial", async()=>{
            const before = await B();
            
            await acquire(AMOUNT_0);

            const after = await B();

            assertValues(before,after,{
              amount: AMOUNT_0,
            })
            
            assert.isFalse(isSameKey(before.poster, after.poster), "change:poster");
            assert.isTrue(isSameKey(after.poster, getSigner().publicKey),"value:poster");

            

          });
          it("subsequent", async()=>{

            // todo();// add emssage and then make sure its cleared

            await acquire(AMOUNT_0);

            await g.append("AAAAA");

            const before = await B();

            setSigner(poster1);
            await acquire(AMOUNT_1);

            const after = await B();

            assertValues(before,after,{
              amount: AMOUNT_1,
              message: "",
            })
            
            assert.isFalse(isSameKey(before.poster, after.poster), "change:poster");
            assert.isTrue(isSameKey(after.poster, getSigner().publicKey),"value:poster");

          });
        });
        describe("Takes correct payment, and sends", ()=>{
          it("to creator (first acquire)", async()=>{

            const creator_balance_before = await getBalance(creator.publicKey);

            await acquire( AMOUNT_0);

            const creator_balance_after = await getBalance(creator.publicKey);

            assert.notEqual(AMOUNT_0,0n,"zero");
            assert.equal(creator_balance_after, creator_balance_before + AMOUNT_0,"creator balance");


          });
          it("to creator and previous poster(subsequent acquires)", async()=>{
            assert.notEqual(AMOUNT_0,0n,"zero");

            await acquire(AMOUNT_0);

            await setSigner(poster1);


            const creator_balance_before = await getBalance(creator.publicKey);
            const poster_balance_before = await getBalance(poster0.publicKey);


            await acquire(AMOUNT_1);

            const amount_to_creator = (AMOUNT_1 - AMOUNT_0) * PERCENT_PROTOCOL / HUNDRED;
            const amount_to_poster = AMOUNT_1 - amount_to_creator;
            assert.notEqual(amount_to_creator,0n,"not zero: to creator");
            assert.notEqual(amount_to_poster,0n,"not zero: to poster");


            const creator_balance_after = await getBalance(creator.publicKey);
            const poster_balance_after = await getBalance(poster0.publicKey);

            assert.equal(creator_balance_after,creator_balance_before + amount_to_creator,"balance: creator");
            assert.equal(poster_balance_after,poster_balance_before + amount_to_poster,"balance: poster");
            

          });
        })
        describe("Can't acquire if", async()=>{

          // it("Message too long", async()=>{
          //     const BAD_MESSAGE = "TEST".padEnd(Number(MESSAGE_SIZE));

          //     await failsCorrectly(async()=>{
          //       await post(BAD_MESSAGE,1000n);
          //     },ERROR_SIZE);
          // });

          it("Insufficient amount", async()=>{
            const AMOUNT_0 = 10_000_000n;
            const AMOUNT_BAD =  10_099_999n;
            const AMOUNT_GOOD = 10_100_000n;
            
            await acquire(AMOUNT_0);
            
            await failsCorrectly(async()=>{
              await acquire(AMOUNT_BAD);
            }, ERROR_AMOUNT)

            await succeeds(async()=>{
              await acquire(AMOUNT_GOOD);
            })
          });
          it("Insufficient balance", async()=>{
              const bal = await getBalance(getSigner().publicKey);

              await fails(async()=>{
                await acquire(bal +1n);
              });
              // todo();//the code here
          });
          describe("Incorrect address supplied for", ()=>{
            beforeEach(async()=>{
              await acquire(100n);
            });
              it("creator", async()=>{

                await prepareForAcquire();
                addAccounts({
                  creator: nonCreator.publicKey,
                })

                await failsWithCode(async()=>{
                  await g.acquire(200n);
                },"0x7dc");
                // todo()// code for bad account
              })
              it("prevPoster", async()=>{

                await prepareForPost();
                addAccounts({
                  prevPoster: nonPoster.publicKey,
                })

                await failsWithCode(async()=>{
                  await g.acquire(200n);
                },"0x7dc");
              })
              it("both", async()=>{
                await prepareForPost();
                addAccounts({
                  creator: nonCreator.publicKey,
                  prevPoster: nonPoster.publicKey,
                })

                await failsWithCode(async()=>{
                  await g.acquire(200n);
                },"0x7dc");
              })
          });
        });

      });
      describe("append", ()=>{

        beforeEach(async()=>{

          // log("append before each")

          setSigner(poster0);

          await acquire(100n);
        })

        it("Can append", async()=>{
          await succeeds(async()=>{
            await g.append(MESSAGE_0);
          })
        });
        it("updates vars", async()=>{

          const state0 = await B();

          await g.append(MESSAGE_0);

          const state1 = await B();

          await g.append(MESSAGE_1);

          const state2 = await B();

          assert.equal(state0.message,"","state 0");
          assert.equal(state1.message,MESSAGE_0,"state 1");
          assert.equal(state2.message,MESSAGE_0+MESSAGE_1,"state 2");

        });
        describe("Cant append if", ()=>{
          it("not poster", async()=>{

            setSigner(nonPoster);
            await failsWithCode(async()=>{
              await g.append(MESSAGE_0);
            },"0x7dc")

          })
          it("combined message too long", async()=>{

            //todo: this is erroring because tx is identical - it is a svmlite issue not a contract issue

            const BAD_MESSAGE = "TEST".padEnd(Number(TX_MESSAGE_SIZE_LIMIT),"X");
            // const BAD_MESSAGE = "TEST one two three";
            // let total_message = "";
            // let i = 0;
            let total_message = (await B()).message;
            while((total_message + BAD_MESSAGE).length <= Number(MESSAGE_SIZE)){
              // await g.append(MESSAGE_0);
              await append(BAD_MESSAGE);
              total_message = (await B()).message;
              // total_message += MESSAGE_0;
              // log(i++)
              // log(total_message)
            }

            await failsCorrectly(async()=>{
                await g.append(BAD_MESSAGE);
            },ERROR_SIZE);
          });
        })
        
      });
      describe("clear", ()=>{

        beforeEach(async()=>{

          setSigner(poster0);

          await acquire(100n);
          await append(MESSAGE_0);
        })

        it("Can clear", async()=>{

          await succeeds(async()=>{
              await g.clear();
          })

        });
        it("updates vars", async()=>{
          const before = await B();

          await g.clear();

          const after = await B();

          assertValues(before,after,{
            message: "",
          });

        });
        describe("Cant clear if", ()=>{
          it("not poster", async()=>{
              setSigner(nonPoster);

              await failsWithCode(async()=>{
                await g.clear();
              },"0x7dc");
          })
        })
        
      });
    });



  })
});
