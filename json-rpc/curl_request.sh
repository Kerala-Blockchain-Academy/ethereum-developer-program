#!/usr/bin/env bash

set -e

execute() {
    web3_clientVersion
    net_version
    net_listening
    net_peerCount
    eth_chainId
    eth_gasPrice
    eth_accounts
    eth_blockNumber
    eth_getBlockByNumber
}

req_handler() {
    response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" --data "$@" "${CHAIN_URL}")
    status=$(echo "$response" | tail -n1)

    if [ "$status" != "200" ]; then
        echo "$(logred [ERROR]): Chain is unreachable at $(logblu ${CHAIN_URL})" 1>&2
        return 1
    fi

    echo "$response" | sed '$d'
}

body_parser() {
    echo "$@" | jq -r '.result'
}

# Log
logred() { echo -e "\033[31m$@\033[0m"; }
loggrn() { echo -e "\033[32m$@\033[0m"; }
logyel() { echo -e "\033[33m$@\033[0m"; }
logblu() { echo -e "\033[34m$@\033[0m"; }
logmag() { echo -e "\033[35m$@\033[0m"; }
logcyn() { echo -e "\033[36m$@\033[0m"; }

# JSON-RPC API Methods
web3_clientVersion() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}')
    echo "Client: $(logmag $(body_parser "$body"))"
    return 0
}

net_version() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}')
    echo "Network: $(logcyn $(body_parser "$body"))"
    return 0
}

net_listening() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"net_listening","params":[],"id":1}')
    echo "Listening: $(logcyn $(body_parser "$body"))"
    return 0
}

net_peerCount() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}')
    echo "Peers: $(logcyn $(body_parser "$body"))"
    return 0
}

eth_chainId() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}')
    echo "Chain ID: $(loggrn $(body_parser "$body"))"
    return 0
}

eth_gasPrice() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}')
    echo "Gas Price: $(loggrn $(body_parser "$body"))"
    return 0
}

eth_accounts() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}')
    echo "Accounts: $(loggrn $(body_parser "$body"))"
    return 0
}

eth_blockNumber() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}')
    echo "Block Number: $(loggrn $(body_parser "$body"))"
    return 0
}

eth_getBlockByNumber() {
    body=$(req_handler '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", true],"id":1}')
    echo "Latest Block: $(loggrn $(body_parser "$body"))"
    return 0
}

# Config
CHAIN_URL="http://127.0.0.1:8545"

execute
