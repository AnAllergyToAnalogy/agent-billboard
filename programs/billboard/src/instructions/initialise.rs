use anchor_lang::prelude::*;

use crate::state::{Billboard};
use crate::constants::{MESSAGE_SIZE};
use crate::error::*;

#[derive(Accounts)]
pub struct Initialise <'info>{

    #[account(
        init,
        seeds = [
            b"billboard".as_ref(),
        ],
        bump,
        payer = signer,
        space = 8 + Billboard::INIT_SPACE 
            + MESSAGE_SIZE as usize // message
    )]
    pub billboard: Account<'info, Billboard>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}


pub fn handle_initialise(ctx: Context<Initialise>, initial_poster: Pubkey) -> Result<()> {

    let billboard     = &mut ctx.accounts.billboard;
    let signer   = &mut ctx.accounts.signer;


    if initial_poster == signer.key() {
        return err!(Errors::Account);
    }

    billboard.creator = signer.key();
    billboard.poster = initial_poster;




    Ok(())
}
