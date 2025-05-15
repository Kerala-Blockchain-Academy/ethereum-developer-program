use alloy::{
    providers::{Provider, ProviderBuilder},
    signers::local::PrivateKeySigner,
    sol,
};
use eyre::Result;

sol!(
    #[sol(
        rpc,
        bytecode = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/../common/contracts/Storage.bin"))
    )]
    Storage,
    "../common/contracts/Storage.json"
);

#[tokio::main]
async fn main() -> Result<()> {
    let rpc_url = "http://127.0.0.1:8545".parse()?;
    let provider = ProviderBuilder::new().connect_http(rpc_url);

    let signer: PrivateKeySigner =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80".parse()?;
    println!("Address: \x1b[32m{}\x1b[0m", signer.address());

    let balance = provider.get_balance(signer.address()).await?;
    println!("Balance: \x1b[33m{balance}\x1b[0m");

    let chain_id = provider.get_chain_id().await?;
    println!("Chain ID: \x1b[33m{chain_id}\x1b[0m");

    let latest_block = provider.get_block_number().await?;
    println!("Current Block: \x1b[33m{latest_block}\x1b[0m");

    let deployer = Storage::deploy_builder(&provider);
    let deploy_tx = deployer
        .from(signer.address())
        .send()
        .await?
        .get_receipt()
        .await?;

    println!(
        "Deployment Tx Hash: \x1b[32m{}\x1b[0m",
        deploy_tx.transaction_hash.to_string()
    );

    let contract = Storage::new(deploy_tx.contract_address.unwrap(), provider.clone());

    let trx = contract
        .store("This message is stored using Rust.".to_string())
        .from(signer.address())
        .send()
        .await?
        .get_receipt()
        .await?;

    println!(
        "Storage Tx Hash: \x1b[32m{}\x1b[0m",
        trx.transaction_hash.to_string()
    );

    let message = contract.retrieve().call().await?;
    println!("Message: \x1b[34m{message}\x1b[0m");

    let latest_block = provider.get_block_number().await?;
    println!("Latest Block: \x1b[33m{latest_block}\x1b[0m");

    Ok(())
}
