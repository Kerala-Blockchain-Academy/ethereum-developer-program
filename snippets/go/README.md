# Snippets for Go

## Prerequisites

[![Go Badge](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=fff&style=for-the-badge)](https://go.dev/)

## Run Locally

Install abigen:

```sh
go install github.com/ethereum/go-ethereum/cmd/abigen@latest
```

Generate Go binding:

```sh
abigen --v2 --bin /path/to/bytecode --abi /path/to/abi --pkg main --type Storage --out Storage.go
```

> **Note**: `--out` takes output file for the generated binding (default = stdout), `--type` takes struct name for the binding (default = package name),`--pkg` takes package name to generate the binding into and `--v2` generates v2 bindings (default: false).

Run the Hardhat node simulation:

```sh
cd .. && cd common/hardhat/
npm run node
```

Run the module to deploy and interact:

```sh
go run .
```

For reference, check out [the official documentation](https://geth.ethereum.org/docs/developers/dapp-developer/native-bindings-v2).
