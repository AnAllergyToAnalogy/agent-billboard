use anchor_lang::prelude::*;

// Acquire
#[event]
pub struct Acquired {
    pub poster: Pubkey,
    pub amount: u64,
}

// Append, Clear
#[event]
pub struct Updated {}