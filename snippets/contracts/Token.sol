// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract Token {
    mapping(uint256 => address) owner;

    event Transfer(uint256 tokenId, address newOwner);

    function mint() internal returns (uint256) {
        uint256 tokenId = block.timestamp;
        owner[tokenId] = msg.sender;
        return tokenId;
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        return owner[_tokenId];
    }

    function buy(uint256 _tokenId) public payable virtual {}

    function transfer(uint256 _tokenId, address _newOwner) internal {
        owner[_tokenId] = _newOwner;
        emit Transfer(_tokenId, _newOwner);
    }
}
