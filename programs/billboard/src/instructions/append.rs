use anchor_lang::prelude::*;

use crate::state::{Billboard};
use crate::constants::{MESSAGE_SIZE};

use crate::error::*;
use crate::event::{Updated};


#[derive(Accounts)]
pub struct Append <'info>{
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

pub fn handle_append(ctx: Context<Append>, message: String) -> Result<()> {
    let billboard = &mut ctx.accounts.billboard;

    if billboard.message.len() + message.len() > MESSAGE_SIZE as usize{
        return err!(Errors::Size);
    }

    billboard.message += &message;

    emit!(Updated{});

    Ok(())
}