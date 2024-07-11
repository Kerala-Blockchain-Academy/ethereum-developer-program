// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Cert is Ownable {

    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

  struct Certificate {
      string name;
      string course;
      string grade;
      string date;
  }

  mapping (uint256 => Certificate) public Certificates;

  event issued(uint256 cid, string cidate);

  function issue (
      uint256 _id,
      string memory _name,
      string memory _course,
      string memory _grade,
      string memory _date) public onlyOwner {
          Certificates[_id] = Certificate(_name, _course, _grade, _date);
          emit issued(_id, _date);
      }
}

