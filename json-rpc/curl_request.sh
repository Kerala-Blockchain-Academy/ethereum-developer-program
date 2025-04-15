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
	method="$1"
	params="$2"
	id="$3"

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
	req=$(req_builder "web3_clientVersion")
	body=$(req_handler "$req")
	echo "Client: $(logmag $(body_parser "$body"))"
	return 0
}

net_version() {
	req=$(req_builder "net_version")
	body=$(req_handler "$req")
	echo "Network: $(logcyn $(body_parser "$body"))"
	return 0
}

net_listening() {
	req=$(req_builder "net_listening")
	body=$(req_handler "$req")
	echo "Listening: $(logcyn $(body_parser "$body"))"
	return 0
}

net_peerCount() {
	req=$(req_builder "net_peerCount")
	body=$(req_handler "$req")
	echo "Peers: $(logcyn $(body_parser "$body"))"
	return 0
}

eth_chainId() {
	req=$(req_builder "eth_chainId")
	body=$(req_handler "$req")
	echo "Chain ID: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_gasPrice() {
	req=$(req_builder "eth_gasPrice")
	body=$(req_handler "$req")
	echo "Gas Price: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_accounts() {
	req=$(req_builder "eth_accounts")
	body=$(req_handler "$req")
	echo "Accounts: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_blockNumber() {
	req=$(req_builder "eth_blockNumber")
	body=$(req_handler "$req")
	echo "Block Number: $(loggrn $(body_parser "$body"))"
	return 0
}

eth_getBlockByNumber() {
	req=$(req_builder "eth_getBlockByNumber" '["latest",true]')
	body=$(req_handler "$req")
	echo "Latest Block: $(loggrn $(body_parser "$body"))"
	return 0
}

if [[ -z "$1" ]]; then
    echo "$(logred [ERROR]): CHAIN_URL is required." 1>&2
    exit 1
fi

CHAIN_URL="$1"

execute
