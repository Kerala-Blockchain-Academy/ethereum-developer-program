// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./OracleV2.sol";

contract InteractOracleV2 {
    OracleV2 internal OracleV2Obj;

    constructor(address OracleV2Addr) {
        OracleV2Obj = OracleV2(OracleV2Addr);
    }

    function requestUpdate() public {
        OracleV2Obj.requestPriceData();
    }

    function getPriceData() public view returns (string memory) {
        return OracleV2Obj.priceData();
    }
}