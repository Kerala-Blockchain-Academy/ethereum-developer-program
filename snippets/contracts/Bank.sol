// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Bank {
    mapping(address => uint256) balanceLedger;
    mapping(uint256 => address) accountLedger;
    uint256 addressCount;
    address owner;

    event Deposit(address, uint256);
    modifier checkBalance(uint256 amt) {
        require(amt <= balanceLedger[msg.sender], "Insufficient Balance");
        require(
            (balanceLedger[msg.sender] - amt) > 50,
            "Minimum Balance Violation"
        );
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Access Denied");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        if (balanceLedger[msg.sender] == 0) {
            accountLedger[addressCount++] = msg.sender;
        }
        balanceLedger[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public checkBalance(amount) {
        balanceLedger[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function transfer(
        address payable recipient,
        uint256 amount
    ) public checkBalance(amount) {
        balanceLedger[msg.sender] -= amount;
        balanceLedger[recipient] += amount;
        recipient.transfer(amount);
    }

    function getMyBalance() public view returns (uint256) {
        return balanceLedger[msg.sender];
    }

    function deleteMyAccount() public {
        payable(msg.sender).transfer(balanceLedger[msg.sender]);
        delete balanceLedger[msg.sender];
    }

    function getBankBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function dissolveBank() public onlyOwner {
        address indexAddress;
        for (uint256 i = 0; i < addressCount; i++) {
            indexAddress = accountLedger[i];
            payable(indexAddress).transfer(balanceLedger[indexAddress]);
            delete balanceLedger[indexAddress];
            delete accountLedger[i];
        }
        delete addressCount;
    }
}
