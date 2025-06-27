# Testing with Geth

Tests for Certifcate smart contract using **Go** and **Geth**.

## Prerequisites

[![Go Badge](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=fff&style=for-the-badge)](https://go.dev/)
[![Abigen Badge](https://img.shields.io/badge/Abigen-3C3C3D?logo=ethereum&logoColor=fff&style=for-the-badge)](https://geth.ethereum.org/docs/developers/dapp-developer/native-bindings-v2#abigen)

## Run Locally

> **Note**: Compile the [Certificate smart contract](./Cert.sol) using a tool or framework of your choice and save the ABI and bytecode to [Cert.json](./Cert.json) and [Cert.bin](./Cert.bin), respectively.

Install Abigen:

```sh
go install github.com/ethereum/go-ethereum/cmd/abigen@latest
```

Generate Go binding for contract:

```bash
abigen --v2 --abi Cert.json --bin Cert.bin --pkg main --type Cert --out Cert.go
```

> **Note**: The above steps are optional; mandatory if you've edited the smart contract.

Run tests:

```sh
go test
```
