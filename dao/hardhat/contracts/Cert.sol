// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Cert is Ownable { // EOA, EC, Self, Child

    struct Certificate {
        string name;
        string course;
        string grade;
        string date;
    }

    mapping (uint256 => Certificate) public Certificates;

    event issued(uint256 cid, string cidate);

    constructor(address _issuer) Ownable(_issuer)
    { }

    function issue (
        uint256 _id,
        string memory _name,
        string memory _course,
        string memory _grade,
        string memory _date
    ) public onlyOwner {
        Certificates[_id] = Certificate(_name, _course, _grade, _date);
        // Certifiactes[_id].name = _name;
        emit issued(_id, _date);
    }
}