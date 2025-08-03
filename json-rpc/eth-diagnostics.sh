#!/usr/bin/env bash

# Ethereum JSON-RPC Diagnostics Tool
# Author: Mobin Mohanan (tr1sm0s1n)
# Version: 1.0.0

set -euo pipefail
IFS=$'\n\t'

# Global configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly VERSION="1.0.0"
readonly TIMEOUT=30
readonly MAX_RETRIES=3

# Global variables
CHAIN_URL=""
VERBOSE=false
REQUEST_ID=1
PARALLEL_MODE=false

# Color definitions with fallback for non-terminal environments
USE_COLORS=true

# Check if we should use colors
if [[ ! -t 1 ]] || [[ "${NO_COLOR:-}" == "1" ]] || [[ "${TERM:-}" == "dumb" ]]; then
    USE_COLORS=false
fi

# Color definitions
if [[ "$USE_COLORS" == true ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    MAGENTA='\033[0;35m'
    CYAN='\033[0;36m'
    WHITE='\033[1;37m'
    BOLD='\033[1m'
    DIM='\033[2m'
    RESET='\033[0m'
    CHECKMARK="✓"
    CROSSMARK="✗"
    ARROW="→"
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    MAGENTA=''
    CYAN=''
    WHITE=''
    BOLD=''
    DIM=''
    RESET=''
    CHECKMARK="[OK]"
    CROSSMARK="[FAIL]"
    ARROW="->"
fi

# Logging functions with timestamps and levels
log_with_level() {
    local level="$1"
    local color="$2"
    local message="$3"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    if [[ "$VERBOSE" == true ]] || [[ "$level" != "DEBUG" ]]; then
        if [[ "$USE_COLORS" == true ]]; then
            printf "\e[2m[%s]\e[0m \e%s%s\e[0m %s\n" \
                "$timestamp" "${color#\\033}" "$level" "$message" >&2
        else
            printf "[%s] %s %s\n" "$timestamp" "$level" "$message" >&2
        fi
    fi
}

log_error() { log_with_level "ERROR" "[0;31m" "$1"; }
log_warn() { log_with_level "WARN" "[1;33m" "$1"; }
log_info() { log_with_level "INFO" "[0;34m" "$1"; }
log_success() { log_with_level "SUCCESS" "[0;32m" "$1"; }
log_debug() { log_with_level "DEBUG" "[2m" "$1"; }

# Enhanced colored output functions
print_colored() {
    local color="$1"
    local text="$2"
    if [[ "$USE_COLORS" == true ]]; then
        printf "\e%s%s\e%s" "${color#\\033}" "$text" "${RESET#\\033}"
    else
        printf "%s" "$text"
    fi
}

print_header() {
    local title="$1"
    if [[ "$USE_COLORS" == true ]]; then
        printf "\n\e[1;36m━━━ %s ━━━\e[0m\n" "$title"
    else
        printf "\n=== %s ===\n" "$title"
    fi
}

print_separator() {
    local separator="──────────────────────────────────────────"
    if [[ "$USE_COLORS" == true ]]; then
        printf "\e[2m%s\e[0m\n" "$separator"
    else
        printf "%s\n" "$separator"
    fi
}

# Dependency checking
check_dependencies() {
    local deps=("curl" "jq")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Please install: sudo apt-get install ${missing_deps[*]} (Ubuntu/Debian)"
        log_info "Or: brew install ${missing_deps[*]} (macOS)"
        exit 1
    fi
}

# Enhanced request builder with validation
req_builder() {
    local method="$1"
    local params="${2:-[]}"
    local id="${3:-$REQUEST_ID}"
    
    # Validate method format
    if [[ ! "$method" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
        log_error "Invalid method format: $method"
        return 1
    fi
    
    # Validate JSON params
    if [[ "$params" != "[]" ]] && ! echo "$params" | jq empty 2>/dev/null; then
        log_error "Invalid JSON parameters: $params"
        return 1
    fi
    
    printf '{"jsonrpc":"2.0","method":"%s","params":%s,"id":%d}' "$method" "$params" "$id"
    ((REQUEST_ID++))
}

# Robust request handler with retry logic and detailed error reporting
req_handler() {
    local request="$1"
    local attempt=1
    local response
    local http_code
    local json_response
    local error_occurred=false
    
    log_debug "Sending request: $request"
    
    while [[ $attempt -le $MAX_RETRIES ]]; do
        log_debug "Attempt $attempt/$MAX_RETRIES"
        
        # Make request with timeout and capture both body and status
        if response=$(curl -s -m "$TIMEOUT" \
                          -w "\n%{http_code}\n%{time_total}" \
                          -H "Content-Type: application/json" \
                          -H "User-Agent: eth-diagnostics/$VERSION" \
                          --data "$request" \
                          "$CHAIN_URL" 2>&1); then
            
            # Parse response components
            json_response=$(echo "$response" | sed -n '1p')
            http_code=$(echo "$response" | sed -n '2p')
            response_time=$(echo "$response" | sed -n '3p')
            
            log_debug "HTTP Code: $http_code, Response Time: ${response_time}s"
            
            # Check HTTP status
            if [[ "$http_code" == "200" ]]; then
                # Validate JSON response
                if echo "$json_response" | jq empty 2>/dev/null; then
                    # Check for JSON-RPC error
                    if echo "$json_response" | jq -e '.error' >/dev/null 2>&1; then
                        local error_code error_message
                        error_code=$(echo "$json_response" | jq -r '.error.code // "unknown"')
                        error_message=$(echo "$json_response" | jq -r '.error.message // "unknown error"')
                        
                        # Don't log error for method not found if it's expected (like for dev nodes)
                        if [[ "$error_code" != "-32601" ]]; then
                            log_error "JSON-RPC Error [$error_code]: $error_message"
                        fi
                        
                        # Return the error info for caller to handle
                        echo "ERROR:$error_code:$error_message"
                        return 1
                    fi
                    echo "$json_response"
                    return 0
                else
                    log_error "Invalid JSON response: $json_response"
                fi
            else
                log_error "HTTP Error $http_code"
            fi
        else
            log_error "Connection failed (curl exit code: $?)"
        fi
        
        if [[ $attempt -lt $MAX_RETRIES ]]; then
            local wait_time=$((attempt * 2))
            log_warn "Retrying in ${wait_time}s..."
            sleep "$wait_time"
        fi
        
        ((attempt++))
    done
    
    log_error "Failed after $MAX_RETRIES attempts"
    return 1
}

# Enhanced body parser with null handling
body_parser() {
    local response="$1"
    local result
    
    result=$(echo "$response" | jq -r '.result // empty')
    
    if [[ -z "$result" || "$result" == "null" ]]; then
        echo "N/A"
    else
        echo "$result"
    fi
}

# Unit conversion utilities
wei_to_gwei() {
    local wei="$1"
    if [[ "$wei" =~ ^0x ]]; then
        # Convert hex to decimal, then to Gwei
        local decimal
        decimal=$(printf "%d" "$wei")
        echo "scale=9; $decimal / 1000000000" | bc -l 2>/dev/null || echo "$wei"
    else
        echo "$wei"
    fi
}

format_block_number() {
    local hex_num="$1"
    if [[ "$hex_num" =~ ^0x ]]; then
        printf "%d (0x%x)" "$(printf "%d" "$hex_num")" "$(printf "%d" "$hex_num")"
    else
        echo "$hex_num"
    fi
}

# Network information retrieval functions
get_client_version() {
    local req body result
    req=$(req_builder "web3_clientVersion")
    if body=$(req_handler "$req") && result=$(body_parser "$body"); then
        printf "%-20s %s %s %s\n" "Client Version:" "$CHECKMARK" "$(print_colored "$MAGENTA" "$result")"
    else
        printf "%-20s %s %s\n" "Client Version:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
    fi
    return 0
}

get_network_info() {
    local req body result
    req=$(req_builder "net_version")
    if body=$(req_handler "$req") && result=$(body_parser "$body"); then
        local network_name
        case "$result" in
            "1") network_name="Mainnet" ;;
            "17000") network_name="Holesky" ;;
            "11155111") network_name="Sepolia" ;;
            "560048") network_name="Hoodi" ;;
            *) network_name="Unknown" ;;
        esac
        printf "%-20s %s %s (%s)\n" "Network:" "$CHECKMARK" "$(print_colored "$CYAN" "$result")" "$network_name"
    else
        printf "%-20s %s %s\n" "Network:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
    fi
    return 0
}

get_listening_status() {
    local req body result
    req=$(req_builder "net_listening")
    
    body=$(req_handler "$req")
    local req_exit_code=$?
    
    # Check if the request failed
    if [[ $req_exit_code -ne 0 ]]; then
        # Check if it's a method not found error (common in dev nodes)
        if [[ "$body" == ERROR:*-32601* ]] || [[ "$body" == *"Method not found"* ]]; then
            printf "%-20s %s %s\n" "Listening:" "ℹ" "$(print_colored "$YELLOW" "N/A (dev node)")"
            return 0
        else
            printf "%-20s %s %s\n" "Listening:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
            return 0  # Don't exit the script, continue with other checks
        fi
    fi
    
    # If we got here, the request succeeded
    result=$(body_parser "$body")
    local color status
    if [[ "$result" == "true" ]]; then
        color="$GREEN"
        status="$CHECKMARK"
    else
        color="$YELLOW"
        status="⚠"
    fi
    printf "%-20s %s %s\n" "Listening:" "$status" "$(print_colored "$color" "$result")"
    return 0
}

get_peer_count() {
    local req body result decimal_peers
    req=$(req_builder "net_peerCount")
    
    body=$(req_handler "$req")
    local req_exit_code=$?
    
    # Check if the request failed
    if [[ $req_exit_code -ne 0 ]]; then
        # Check if it's a method not found error (common in dev nodes)
        if [[ "$body" == ERROR:*-32601* ]] || [[ "$body" == *"Method not found"* ]]; then
            printf "%-20s %s %s\n" "Peer Count:" "ℹ" "$(print_colored "$YELLOW" "N/A (dev node)")"
            return 0
        else
            printf "%-20s %s %s\n" "Peer Count:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
            return 1
        fi
    fi
    
    # If we got here, the request succeeded
    result=$(body_parser "$body")
    if [[ "$result" =~ ^0x ]]; then
        decimal_peers=$(printf "%d" "$result")
        local color status
        if [[ $decimal_peers -gt 0 ]]; then
            color="$GREEN"
            status="$CHECKMARK"
        else
            color="$YELLOW"
            status="⚠"
        fi
        printf "%-20s %s %s (%s)\n" "Peer Count:" "$status" "$(print_colored "$color" "$decimal_peers")" "$result"
    else
        printf "%-20s %s %s\n" "Peer Count:" "$CHECKMARK" "$(print_colored "$CYAN" "$result")"
    fi
    return 0
}

get_chain_id() {
    local req body result
    req=$(req_builder "eth_chainId")
    if body=$(req_handler "$req"); then
        result=$(body_parser "$body")
        if [[ "$result" =~ ^0x ]]; then
            local decimal_id
            decimal_id=$(printf "%d" "$result")
            printf "%-20s %s %s (%s)\n" "Chain ID:" "$CHECKMARK" "$(print_colored "$GREEN" "$decimal_id")" "$result"
        else
            printf "%-20s %s %s\n" "Chain ID:" "$CHECKMARK" "$(print_colored "$GREEN" "$result")"
        fi
        return 0
    else
        printf "%-20s %s %s\n" "Chain ID:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
        return 1
    fi
}

get_gas_price() {
    local req body result gwei_price
    req=$(req_builder "eth_gasPrice")
    if body=$(req_handler "$req"); then
        result=$(body_parser "$body")
        gwei_price=$(wei_to_gwei "$result")
        printf "%-20s %s %s Gwei (%s)\n" "Gas Price:" "$CHECKMARK" "$(print_colored "$GREEN" "$gwei_price")" "$result"
        return 0
    else
        printf "%-20s %s %s\n" "Gas Price:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
        return 1
    fi
}

get_accounts() {
    local req body result account_count
    req=$(req_builder "eth_accounts")
    if body=$(req_handler "$req"); then
        result=$(body_parser "$body")
        if [[ "$result" == "[]" ]] || [[ "$result" == "N/A" ]]; then
            printf "%-20s %s %s\n" "Accounts:" "ℹ" "$(print_colored "$YELLOW" "No unlocked accounts")"
        else
            account_count=$(echo "$result" | jq '. | length' 2>/dev/null || echo "unknown")
            printf "%-20s %s %s accounts\n" "Accounts:" "$CHECKMARK" "$(print_colored "$GREEN" "$account_count")"
            if [[ "$VERBOSE" == true ]]; then
                echo "$result" | jq -r '.[] // empty' | while read -r account; do
                    printf "  %s %s\n" "$ARROW" "$(print_colored "$DIM" "$account")"
                done
            fi
        fi
        return 0
    else
        printf "%-20s %s %s\n" "Accounts:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
        return 1
    fi
}

get_block_number() {
    local req body result formatted_number
    req=$(req_builder "eth_blockNumber")
    if body=$(req_handler "$req"); then
        result=$(body_parser "$body")
        formatted_number=$(format_block_number "$result")
        printf "%-20s %s %s\n" "Block Number:" "$CHECKMARK" "$(print_colored "$GREEN" "$formatted_number")"
        return 0
    else
        printf "%-20s %s %s\n" "Block Number:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
        return 1
    fi
}

get_latest_block() {
    local req body result
    req=$(req_builder "eth_getBlockByNumber" '["latest",false]')
    if body=$(req_handler "$req"); then
        result=$(body_parser "$body")
        if [[ "$result" != "N/A" ]] && [[ "$result" != "null" ]]; then
            local hash number timestamp tx_count
            hash=$(echo "$result" | jq -r '.hash // "N/A"')
            number=$(echo "$result" | jq -r '.number // "N/A"')
            timestamp=$(echo "$result" | jq -r '.timestamp // "N/A"')
            tx_count=$(echo "$result" | jq -r '.transactions | length' 2>/dev/null || echo "N/A")
            
            printf "%-20s %s\n" "Latest Block:" "$CHECKMARK"
            printf "  %-15s %s\n" "Hash:" "$(print_colored "$BLUE" "${hash:0:42}...")"
            printf "  %-15s %s\n" "Number:" "$(print_colored "$GREEN" "$(format_block_number "$number")")"
            if [[ "$timestamp" != "N/A" ]] && [[ "$timestamp" =~ ^0x ]]; then
                local decimal_timestamp readable_time
                decimal_timestamp=$(printf "%d" "$timestamp")
                readable_time=$(date -d "@$decimal_timestamp" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "Invalid")
                printf "  %-15s %s (%s)\n" "Time:" "$(print_colored "$CYAN" "$readable_time")" "$timestamp"
            fi
            printf "  %-15s %s\n" "Transactions:" "$(print_colored "$MAGENTA" "$tx_count")"
        else
            printf "%-20s %s %s\n" "Latest Block:" "$CROSSMARK" "$(print_colored "$RED" "No data")"
        fi
        return 0
    else
        printf "%-20s %s %s\n" "Latest Block:" "$CROSSMARK" "$(print_colored "$RED" "Failed")"
        return 1
    fi
}

# Main execution function with parallel processing option
execute_diagnostics() {
    print_header "Ethereum JSON-RPC Diagnostics Tool"
    if [[ "$USE_COLORS" == true ]]; then
        printf "Target: \e[1;37m%s\e[0m\n\n" "$CHAIN_URL"
    else
        printf "Target: %s\n\n" "$CHAIN_URL"
    fi
    
    local functions=(
        "get_client_version"
        "get_network_info"
        "get_listening_status"
        "get_peer_count"
        "get_chain_id"
        "get_gas_price"
        "get_accounts"
        "get_block_number"
        "get_latest_block"
    )
    
    local start_time end_time
    start_time=$(date +%s.%N)
    
    if [[ "$PARALLEL_MODE" == true ]]; then
        log_info "Running diagnostics in parallel mode..."
        local pids=()
        for func in "${functions[@]}"; do
            $func &
            pids+=($!)
        done
        
        # Wait for all background processes
        for pid in "${pids[@]}"; do
            wait "$pid"
        done
    else
        for func in "${functions[@]}"; do
            log_debug "Executing: $func"
            if ! $func; then
                log_debug "Function $func completed with non-zero exit code"
            fi
        done
    fi
    
    end_time=$(date +%s.%N)
    local duration
    duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "unknown")
    
    print_separator
    printf "Diagnostics completed in %s seconds\n" "$(print_colored "$GREEN" "$duration")"
}

# Usage information
usage() {
    if [[ "$USE_COLORS" == true ]]; then
        cat << EOF
$(printf "\e[1mEthereum JSON-RPC Diagnostics Tool v%s\e[0m" "$VERSION")

$(printf "\e[1mUSAGE:\e[0m")
    $SCRIPT_NAME [OPTIONS] <RPC_URL>

$(printf "\e[1mOPTIONS:\e[0m")
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging
    -V, --version           Show version information
    -p, --parallel          Run requests in parallel (faster)
    --no-color              Disable colored output

$(printf "\e[1mEXAMPLES:\e[0m")
    $SCRIPT_NAME http://localhost:8545
    $SCRIPT_NAME --verbose https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

EOF
    else
        cat << EOF
Ethereum JSON-RPC Diagnostics Tool v$VERSION

USAGE:
    $SCRIPT_NAME [OPTIONS] <RPC_URL>

OPTIONS:
    -h, --help              Show this help message
    -v, --verbose           Enable verbose logging
    -V, --version           Show version information
    -p, --parallel          Run requests in parallel (faster)
    --no-color              Disable colored output

EXAMPLES:
    $SCRIPT_NAME http://localhost:8545
    $SCRIPT_NAME --verbose https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

EOF
    fi
}

# Version information
version_info() {
    if [[ "$USE_COLORS" == true ]]; then
        printf "\e[1mEthereum JSON-RPC Client\e[0m\n"
        printf "Version: %s\n" "$VERSION"
        printf "Dependencies: curl, jq, bc\n"
        printf "Author: Mobin Mohanan (tr1sm0s1n)\n"
    else
        printf "Ethereum JSON-RPC Client\n"
        printf "Version: %s\n" "$VERSION"
        printf "Dependencies: curl, jq, bc\n"
        printf "Author: Mobin Mohanan (tr1sm0s1n)\n"
    fi
}

# Argument parsing
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -V|--version)
                version_info
                exit 0
                ;;
            -p|--parallel)
                PARALLEL_MODE=true
                shift
                ;;
            --no-color)
                USE_COLORS=false
                RED=''
                GREEN=''
                YELLOW=''
                BLUE=''
                MAGENTA=''
                CYAN=''
                WHITE=''
                BOLD=''
                DIM=''
                RESET=''
                CHECKMARK="[OK]"
                CROSSMARK="[FAIL]"
                ARROW="->"
                shift
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                if [[ -z "$CHAIN_URL" ]]; then
                    CHAIN_URL="$1"
                else
                    log_error "Multiple URLs provided. Only one URL is allowed."
                    exit 1
                fi
                shift
                ;;
        esac
    done
}

# URL validation
validate_url() {
    local url="$1"
    
    if [[ ! "$url" =~ ^https?:// ]]; then
        log_error "Invalid URL format. Must start with http:// or https://"
        return 1
    fi
    
    # Basic connectivity test
    if ! curl -s -m 5 --head "$url" >/dev/null 2>&1; then
        log_warn "URL might not be reachable: $url"
    fi
}

# Cleanup function
cleanup() {
    log_debug "Cleaning up..."
    # Kill any background processes if parallel mode was used
    if [[ "$PARALLEL_MODE" == true ]]; then
        jobs -p | xargs -r kill 2>/dev/null || true
    fi
}

# Signal handling
trap cleanup EXIT
trap 'log_error "Script interrupted"; exit 130' INT TERM

# Main function
main() {
    # Parse command line arguments
    parse_arguments "$@"
    
    # Validate required arguments
    if [[ -z "$CHAIN_URL" ]]; then
        log_error "RPC URL is required"
        usage
        exit 1
    fi
    
    # Check dependencies
    check_dependencies
    
    # Validate URL
    validate_url "$CHAIN_URL"
    
    # Execute diagnostics
    execute_diagnostics
}

# Run main function with all arguments
main "$@"
