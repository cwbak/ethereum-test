// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SampleToken is ERC20 {
    uint256 public transferIndex;
    address[] public sender;
    address[] public recipient;
    uint256[] public amount;
    uint256[] public transferBlockNumber;
    mapping(address=>uint256) public senderCount;
    mapping(address=>uint256) public recipientCount;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        transferIndex = 0;
        _mint(msg.sender, 1_000_000_000 * 10 ** uint(decimals()));
    }

    function transfer(address to, uint256 value) public override returns (bool) {
        sender.push(msg.sender);
        recipient.push(to);
        amount.push(value);

        uint256 blockNumber = block.number;
        transferBlockNumber.push(blockNumber);

        if (senderCount[msg.sender] != 0) {
            senderCount[msg.sender] += 1;
        } else {
            senderCount[msg.sender] = 1;
        }

        if (recipientCount[to] != 0) {
            recipientCount[to] += 1;
        } else {
            recipientCount[to] = 1;
        }

        transferIndex++;
        return super.transfer(to, value);
    }
}
