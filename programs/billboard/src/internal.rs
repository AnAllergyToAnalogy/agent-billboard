use anchor_lang::prelude::*;

use crate::state::{Billboard};

pub fn _give_sol<'info>(
    user_account: &mut Signer<'info>,
    vault_account: &mut Account<'info, Billboard>, 
    amount: u64
) -> Result<()> {

    // Withdraw to user account 
    **vault_account.to_account_info().try_borrow_mut_lamports()? -= amount;
    **user_account.to_account_info().try_borrow_mut_lamports()? += amount;

    Ok(())
}


pub fn _give_sol_account<'info>(
    receiver_account: &mut AccountInfo<'info>,
    vault_account: &mut Account<'info, Billboard>, 
    amount: u64
) -> Result<()> {

    // Withdraw to user account 
    **vault_account.to_account_info().try_borrow_mut_lamports()? -= amount;
    **receiver_account.to_account_info().try_borrow_mut_lamports()? += amount;

    Ok(())
}


pub fn _take_sol<'info>(
    user_account: &Signer<'info>, 
    vault_account: &mut Account<'info, Billboard>, 
    amount: u64
) -> Result<()> {
    let _ix = anchor_lang::solana_program::system_instruction::transfer(
        &user_account.key(),
        &vault_account.key(),
        amount
    );

    let _ = anchor_lang::solana_program::program::invoke(
        &_ix,
        &[
            user_account.to_account_info(),
            vault_account.to_account_info(),
        ]
    );

    Ok(())
}

pub fn _transfer_sol<'info>(
    sender_account: &Signer<'info>, 
    recipient_account: &mut UncheckedAccount<'info>,
    amount: u64
) -> Result<()> {
        let _ix = anchor_lang::solana_program::system_instruction::transfer(
        &sender_account.key(),
        &recipient_account.key(),
        amount
    );

    let _ = anchor_lang::solana_program::program::invoke(
        &_ix,
        &[
            sender_account.to_account_info(),
            recipient_account.to_account_info(),
        ]
    );

    Ok(())
}

pub fn _clear_message<'info>(billboard: &mut Account<'info, Billboard>) -> Result<()>{
    billboard.message = String::from("");
    Ok(())
}