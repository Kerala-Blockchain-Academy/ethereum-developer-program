// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Token.sol";

contract ItemShop is Token {
    struct Item {
        string title;
        uint256 price;
    }

    mapping(uint256 => Item) items;

    event Added(uint256 tokenId, string title);

    function add(string memory _title, uint256 _price) public {
        uint256 tokenId = mint();
        items[tokenId].title = _title;
        items[tokenId].price = _price;
        emit Added(tokenId, _title);
    }

    function buy(uint256 _tokenId) public payable override {
        require(
            (msg.value / 1 ether) >= items[_tokenId].price,
            "Insufficient Value"
        );
        transfer(_tokenId, msg.sender);
    }
}
