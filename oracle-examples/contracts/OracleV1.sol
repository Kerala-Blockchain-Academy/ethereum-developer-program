// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract OracleV1 {
    string public priceData;

    function setPriceData(string memory _priceData) public {
        priceData = _priceData;
    }
}
