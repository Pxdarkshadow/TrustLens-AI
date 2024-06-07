pragma solidity ^0.8.17;

interface IGnosisSafe {
    function executeTransaction(
        address to,
        uint256 value,
        bytes memory data,
        uint8 operation,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s,
        address[] memory owners,
        uint256[] memory indices
    ) external returns (bool success);
}