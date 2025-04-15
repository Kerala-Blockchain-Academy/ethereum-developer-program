# JSON-RPC API Specification

---

JSON-RPC refers to a stateless, lightweight remote procedure call (RPC) protocol that uses JavaScript Object Notation to encode messages. It establishes
a communication between a client and a server over the network. In blockchains such as Ethereum, a JSON-RPC file defines the steps to communicate with
Ethereum nodes or external APIs.

A DApp interacts with the Ethereum blockchain by connecting to an Ethereum node. Each Ethereum client implements a JSON-RPC specification, which comprises of configuration, function definitions, API methods and interaction logic for handling the RPC requests in the system.

Ensure the local repository is up to date with respect to remote repo.

```sh
git pull
```

Execute the shell script to interact with Ethereum node and retrieve vital information like 'chain ID', 'latest block', 'gas price', etc.

```sh
./json-rpc/curl_request.sh <rpc-url>
```
