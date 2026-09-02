use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Amount is too low. Must be at least 1% higher than previous amount.")]
    Amount,

    #[msg("Maximum message length is 4096 bytes.")]
    Size,

    #[msg("Duplicate account provided.")]
    Account,

}
