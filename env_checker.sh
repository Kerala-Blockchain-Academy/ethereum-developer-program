#!/usr/bin/env bash

checker() {
    if ! command -v "$1" &>/dev/null; then
        echo -e "\033[91m[❌] Not installed: $1\033[0m"
    else
        case "$1" in
        docker)
            version=$(docker version --format '{{.Client.Version}}' 2>/dev/null)
            ;;
        *)
            output=$($1 $2 2>/dev/null | head -n 1)
            version=$(echo "$output" | grep -Eo '[0-9]+(\.[0-9]+){1,2}' | head -n 1)
            ;;
        esac
        echo -e "\033[92m[✅] Installed: $1 ($version)\033[0m"
    fi
}

checker "code" "-v"
checker "git" "--version"
checker "node" "-v"
checker "docker" "version"
checker "go" "version"
checker "cargo" "-V"
checker "uv" "-V"
