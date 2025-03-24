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

req_builder() {
	local method="$1"
	local params="$2"
	local id="$3"

	if [[ -z "$method" ]]; then
		echo "$(logred [ERROR]): Method argument is required." 1>&2
		return 1
	fi

	if [[ -z "$params" ]]; then
		printf '{"jsonrpc":"2.0","method":"%s","params":[],"id":%d}\n' "$method" "$id"
	else
		printf '{"jsonrpc":"2.0","method":"%s","params":%s,"id":%d}\n' "$method" "$params" "$id"
	fi
}

req_handler() {
	local response=$(curl -s -w "\n%{http_code}" -H "Content-Type: application/json" --data "$@" "${CHAIN_URL}")
	local status=$(echo "$response" | tail -n1)

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
	local req=$(req_builder "web3_clientVersion")
	local body=$(req_handler "$req")
	echo "Client: $(logmag $(body_parser "$body"))"
	return 0
}

net_version() {
	local req=$(req_builder "net_version")
	local body=$(req_handler "$req")
	echo "Network: $(logcyn $(body_parser "$body"))"
	return 0
}

net_listening() {
	local req=$(req_builder "net_listening")
	local body=$(req_handler "$req")
	echo "Listening: $(logcyn $(body_parser "$body"))"
	return 0
}

net_peerCount() {
	local req=$(req_builder "net_peerCount")
	local body=$(req_handler "$req")
	echo "Peers: $(logcyn $(body_parser "$body"))"
	return 0
}

eth_chainId() {
	local req=$(req_builder "eth_chainId")
	local body=$(req_handler "$req")
	echo "Chain ID: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_gasPrice() {
	local req=$(req_builder "eth_gasPrice")
	local body=$(req_handler "$req")
	echo "Gas Price: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_accounts() {
	local req=$(req_builder "eth_accounts")
	local body=$(req_handler "$req")
	echo "Accounts: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_blockNumber() {
	local req=$(req_builder "eth_blockNumber")
	local body=$(req_handler "$req")
	echo "Block Number: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_getBlockByNumber() {
	local req=$(req_builder "eth_getBlockByNumber" '["latest",true]')
	local body=$(req_handler "$req")
	echo "Latest Block: $(loggrn $(body_parser "$body"))"
	return 0
}

# Config
CHAIN_URL="http://127.0.0.1:8545"

execute
