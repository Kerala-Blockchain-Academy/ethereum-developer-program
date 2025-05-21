import json
from web3 import Web3
from eth_account import Account


def main():
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

    with open("../contracts/Storage/Storage.json", "r", -1, "utf-8") as a:
        abi = json.load(a)

    with open("../contracts/Storage/Storage.bin", "r", -1, "utf-8") as b:
        bytecode = b.read()

    account = Account.from_key(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    )

    print(f"Address: \033[32m{account.address}\033[0m")
    print(f"Balance: \033[33m{w3.eth.get_balance(account.address)}\033[0m")
    print(f"Chain ID: \033[33m{w3.eth.chain_id}\033[0m")
    print(f"Current Block: \033[33m{w3.eth.get_block_number()}\033[0m")

    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    deploy_tx = contract.constructor().transact()
    tx_receipt = w3.eth.wait_for_transaction_receipt(deploy_tx)
    print(f"Deployment Tx Hash: \033[32m{'0x'+tx_receipt.transactionHash.hex()}\033[0m")

    instance = w3.eth.contract(address=tx_receipt.contractAddress, abi=abi)

    store_tx = instance.functions.store(
        "This message is stored using Python."
    ).transact()
    tx_receipt = w3.eth.wait_for_transaction_receipt(store_tx)
    print(f"Storage Tx Hash: \033[32m{'0x'+tx_receipt.transactionHash.hex()}\033[0m")

    value = instance.functions.retrieve().call()
    print(f"Message: \033[36m{value}\033[0m")

    print(f"Latest Block: \033[33m{w3.eth.get_block_number()}\033[0m")


if __name__ == "__main__":
    main()
