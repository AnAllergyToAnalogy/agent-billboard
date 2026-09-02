use anchor_lang::prelude::*;

use crate::state::{Billboard};

use crate::internal::{
    _clear_message
}; 
use crate::event::{Updated};

#[derive(Accounts)]
pub struct Clear <'info>{
    #[account(
        mut,
        seeds = [
            b"billboard".as_ref()
        ],
        bump,
    )]
    pub billboard: Account<'info, Billboard>,

    #[account(mut, address=billboard.poster)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn handle_clear(ctx: Context<Clear>) -> Result<()> {
    let billboard = &mut ctx.accounts.billboard;

    _clear_message(billboard)?;

    emit!(Updated{});

    Ok(())
}