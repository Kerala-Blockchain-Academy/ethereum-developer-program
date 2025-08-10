#!/usr/bin/env bash

# Development Environment Scanner
# Checks your toolchain with style

set -euo pipefail

# Color palette
readonly RED='\033[38;5;196m'
readonly GREEN='\033[38;5;46m'
readonly BLUE='\033[38;5;39m'
readonly PURPLE='\033[38;5;129m'
readonly YELLOW='\033[38;5;226m'
readonly GRAY='\033[38;5;242m'
readonly BOLD='\033[1m'
readonly RESET='\033[0m'

# Icons
readonly CROSS="❌"
readonly CHECK="✅"
readonly ROCKET="🚀"
readonly GEAR="⚙️"
readonly SPARKLE="✨"

header() {
    echo -e "${BOLD}${BLUE}"
    echo "╔═════════════════════════════════════╗"
    echo "║   Development Environment Scanner   ║"
    echo "╚═════════════════════════════════════╝"
    echo -e "${RESET}"
}

get_version() {
    local tool="$1"
    local flag="$2"
    local version=""
    
    case "$tool" in
        docker)
            # Try the format flag first, fallback to parsing regular output
            if version=$(docker version --format '{{.Client.Version}}' 2>/dev/null); then
                version=$(echo "$version" | tr -d '\n\r' | xargs)
            elif output=$(docker --version 2>/dev/null); then
                version=$(echo "$output" | grep -Eo '[0-9]+(\.[0-9]+){1,2}' | head -n 1)
            else
                version="unknown"
            fi
            [[ -z "$version" ]] && version="unknown"
            ;;
        code)
            output=$($tool $flag 2>/dev/null | head -n 1)
            version=$(echo "$output" | grep -Eo '[0-9]+(\.[0-9]+){1,2}' | head -n 1)
            [[ -z "$version" ]] && version="installed"
            ;;
        *)
            output=$($tool $flag 2>/dev/null | head -n 1)
            version=$(echo "$output" | grep -Eo '[0-9]+(\.[0-9]+){1,2}' | head -n 1)
            [[ -z "$version" ]] && version="unknown"
            ;;
    esac
    
    echo "$version"
}

check_tool() {
    local tool="$1"
    local flag="$2"
    local desc="$3"
    
    printf "${GRAY}${GEAR} Scanning${RESET} %-12s " "$tool"
    
    if ! command -v "$tool" &>/dev/null; then
        echo -e "${RED}${CROSS} Missing${RESET} ${GRAY}($desc)${RESET}"
        return 1
    else
        local version
        version=$(get_version "$tool" "$flag")
        echo -e "${GREEN}${CHECK} v${version}${RESET} ${GRAY}($desc)${RESET}"
        return 0
    fi
}

main() {
    local installed=0
    local total=0
    
    header
    echo -e "${PURPLE}${SPARKLE} Validating your development stack...${RESET}\n"
    
    # Define tools with descriptions
    local tools=(
        "code:-v:Code Editor"
        "git:--version:Version Control"
        "node:-v:JavaScript Runtime"
        "docker:version:Containerization"
        "go:version:Go Language"
        "cargo:-V:Rust Package Manager"
        "uv:-V:Python Package Manager"
    )
    
    for tool_info in "${tools[@]}"; do
        IFS=':' read -r tool flag desc <<< "$tool_info"
        if check_tool "$tool" "$flag" "$desc"; then
            ((installed++))
        fi
        ((total++))
    done
    
    echo
    
    # Summary
    local percentage=$((installed * 100 / total))
    if [[ $percentage -eq 100 ]]; then
        echo -e "${GREEN}${BOLD}${ROCKET} Perfect! All tools ready (${installed}/${total})${RESET}"
    elif [[ $percentage -ge 75 ]]; then
        echo -e "${YELLOW}${BOLD}${GEAR} Almost there! (${installed}/${total}) tools found${RESET}"
    else
        echo -e "${RED}${BOLD}${CROSS} Setup incomplete (${installed}/${total}) - consider installing missing tools${RESET}"
    fi
}

main "$@"
