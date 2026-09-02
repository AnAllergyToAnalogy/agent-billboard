use anchor_lang::prelude::*;

use crate::constants::{MESSAGE_SIZE};

#[account]
#[derive(InitSpace)]
pub struct Billboard {
    pub creator: Pubkey,

    pub poster: Pubkey,
    pub amount: u64,

    #[max_len(MESSAGE_SIZE)]
    pub message:   String,

}

