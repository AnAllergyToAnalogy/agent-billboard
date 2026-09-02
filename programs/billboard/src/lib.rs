pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod event;
mod internal;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;
pub use event::*;

declare_id!("FwNLuU3KfM3C4JESxa3UZWxBrU5y5ExneEs3kd39wk1n");

#[program]
pub mod billboard {
    use super::*;

    pub fn initialise(ctx: Context<Initialise>, initial_poster: Pubkey) -> Result<()> {
        crate::instructions::initialise::handle_initialise(ctx,initial_poster)
    }
    
    pub fn acquire(ctx: Context<Acquire>, amount: u64) -> Result<()> {
        crate::instructions::acquire::handle_acquire(ctx, amount)
    }
    
    pub fn clear(ctx: Context<Clear>) -> Result<()> {
        crate::instructions::clear::handle_clear(ctx)
    }
    
    pub fn append(ctx: Context<Append>, message: String) -> Result<()> {
        crate::instructions::append::handle_append(ctx, message)
    }


    pub fn update_creator(ctx: Context<UpdateCreator>, new_creator: Pubkey) -> Result<()> {
        crate::instructions::update_creator::handle_update_creator(ctx, new_creator)
    }


}
