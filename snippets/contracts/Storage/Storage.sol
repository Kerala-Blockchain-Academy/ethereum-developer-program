// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Storage {
    string message;

    function store(string memory _message) public {
        message = _message;
    }

    function retrieve() public view returns (string memory) {
        return message;
    }
}
