use anchor_lang::prelude::*;

use crate::state::{Billboard};

#[derive(Accounts)]
pub struct UpdateCreator <'info>{
    #[account(
        mut,
        seeds = [
            b"billboard".as_ref()
        ],
        bump,
    )]
    pub billboard: Account<'info, Billboard>,


    #[account(mut, address = billboard.creator)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn handle_update_creator(ctx: Context<UpdateCreator>, new_creator: Pubkey) -> Result<()> {
    let billboard = &mut ctx.accounts.billboard;

    billboard.creator = new_creator;

    Ok(())
}