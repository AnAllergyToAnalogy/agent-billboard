use anchor_lang::prelude::*;

use crate::state::{Billboard};

use crate::constants::{HUNDRED, MIN_PERCENT_INCREASE, PERCENT_PROTOCOL};

use crate::internal::{
    _transfer_sol,
    _clear_message
}; 
use crate::error::*;
use crate::event::{Acquired};


#[derive(Accounts)]
pub struct Acquire <'info>{
    #[account(
        mut,
        seeds = [
            b"billboard".as_ref()
        ],
        bump,
    )]
    pub billboard: Account<'info, Billboard>,


    /// CHECK: Prev poster account to receive SOL
    #[account(mut, address=billboard.poster)]
    pub prev_poster: UncheckedAccount<'info>,
    
    /// CHECK: Creator account to receive SOL
    #[account(mut, address=billboard.creator)]
    pub creator: UncheckedAccount<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn handle_acquire(ctx: Context<Acquire>, amount: u64) -> Result<()> {
    let billboard = &mut ctx.accounts.billboard;
    let signer = &mut ctx.accounts.signer;
    let creator = &mut ctx.accounts.creator;
    let prev_poster = &mut ctx.accounts.prev_poster;
    let signer_key = signer.key();

    let target = billboard.amount * (HUNDRED + MIN_PERCENT_INCREASE)/HUNDRED;

    // check amount
    if amount < target {
        return err!(Errors::Amount);
    }

    //prepare amounts for creator and prev
    let amount_creator = (amount - billboard.amount) * PERCENT_PROTOCOL / HUNDRED;
    let amount_prev = amount - amount_creator;

    // let poster_previous = billboard.poster;
    let amount_previous = billboard.amount;

    // update message, amount and poster
    billboard.poster = signer_key;
    billboard.amount = amount;

    _clear_message(billboard)?;

    // Emit Post
    emit!(Acquired{
        poster: signer_key,
        amount
    });

    
    // take SOL and give to relevant parties
    if amount_previous == 0 {
        // First post, all to creator
        _transfer_sol(
            signer,
            creator,
            amount
        )?;
    }else{
        // Subsequent post, payback previous poster + half of excess, half to creator
        _transfer_sol(
            signer,
            creator,
            amount_creator
        )?;
        _transfer_sol(
            signer,
            prev_poster,
            amount_prev
        )?;
    }

    Ok(())
}