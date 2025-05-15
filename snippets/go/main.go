package main

import (
	"context"
	"fmt"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum/accounts/abi/bind/v2"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const (
	rpcURL     = "http://127.0.0.1:8545"
	privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
)

var ctx = context.Background()

func main() {
	privateKey, err := crypto.HexToECDSA(privateKey[2:])
	if err != nil {
		exit(err)
	}

	address := crypto.PubkeyToAddress(privateKey.PublicKey)
	fmt.Printf("Address: %s\n", address.Hex())

	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		exit(err)
	}

	balance, err := client.BalanceAt(ctx, address, nil)
	if err != nil {
		exit(err)
	}
	fmt.Printf("Balance: %d\n", balance)

	chainID, err := client.ChainID(ctx)
	if err != nil {
		exit(err)
	}
	fmt.Printf("Chain ID: %d\n", chainID)

	currentBlock, err := client.BlockNumber(ctx)
	if err != nil {
		exit(err)
	}
	fmt.Printf("Current Block: %d\n", currentBlock)

	auth := bind.NewKeyedTransactor(privateKey, chainID)

	nonce, err := client.PendingNonceAt(ctx, address)
	if err != nil {
		exit(err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)
	auth.GasLimit = uint64(927000)
	auth.GasPrice = big.NewInt(0)

	gasPrice, err := client.SuggestGasPrice(ctx)
	if err != nil {
		exit(err)
	}
	auth.GasPrice = gasPrice

	deployParams := bind.DeploymentParams{
		Contracts: []*bind.MetaData{&StorageMetaData},
	}

	deployer := bind.DefaultDeployer(auth, client)
	result, err := bind.LinkAndDeploy(&deployParams, deployer)
	if err != nil {
		exit(err)
	}

	contractAddress, err := bind.WaitDeployed(ctx, client, result.Txs[StorageMetaData.ID].Hash())
	if err != nil {
		exit(err)
	}

	fmt.Printf("Deployment Tx Hash: %s\n", result.Txs[StorageMetaData.ID].Hash())

	storage := NewStorage()
	instance := storage.Instance(client, contractAddress)

	nonce, err = client.PendingNonceAt(ctx, address)
	if err != nil {
		exit(err)
	}

	auth.Nonce = big.NewInt(int64(nonce))

	tx, err := bind.Transact(instance, auth, storage.PackStore("This message is stored using Go."))
	if err != nil {
		exit(err)
	}

	if _, err := bind.WaitMined(ctx, client, tx.Hash()); err != nil {
		exit(err)
	}

	fmt.Printf("Storage Tx Hash: %s\n", tx.Hash())

	message, err := bind.Call(instance, nil, storage.PackRetrieve(), storage.UnpackRetrieve)
	if err != nil {
		exit(err)
	}

	fmt.Printf("Message: %s\n", message)

	currentBlock, err = client.BlockNumber(ctx)
	if err != nil {
		exit(err)
	}
	fmt.Printf("Latest Block: %d\n", currentBlock)
}

func exit(err error) {
	fmt.Printf("Error: %v", err)
	os.Exit(1)
}
