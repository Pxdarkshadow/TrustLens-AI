// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

contract GnosisSafe {
    error GnosisExecutionFailed();
    event ExecutedTransaction(address indexed to, uint256 value, bytes data, uint8 operation);

    function execTransaction(
        address to,
        uint256 value,
        bytes memory data,
        uint8 operation
    ) external returns (bool) {
        (bool success,) = to.call{value: value}(data);
       if(!success){
        revert GnosisExecutionFailed();
       }
        emit ExecutedTransaction(to, value, data, operation);
    }
}
