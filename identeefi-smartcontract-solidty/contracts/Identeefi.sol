
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Identeefi {
    address public owner; 

    struct Product {
        string serialNumber;
        mapping(uint => ProductHistory) history;
        uint historySize;
    }

    constructor() {
        owner = msg.sender;
    }

    mapping(string => Product) products;

    struct ProductHistory {
        uint id;
        string hash;
        uint256 timestamp;
        bool isSold;
    }

    function registerProduct(string memory _serialNumber, string memory _hash, uint256 _increaseTimeStamp) public returns(bool) {
        require(block.timestamp != _increaseTimeStamp, "registerProduct: Increase timestamp shouldn't be equal to block.timestamp");

        Product storage p = products[_serialNumber];

        p.serialNumber = _serialNumber;
        p.historySize = 0;

        addProductHistory(_serialNumber, _hash, _increaseTimeStamp, false);
        return true;
    }

    function addProductHistory(string memory _serialNumber, string memory _hash, uint256 _timestamp, bool _isSold) public {
        Product storage p = products[_serialNumber];
        p.historySize++;
        p.history[p.historySize] = ProductHistory(p.historySize, _hash, _timestamp, _isSold);

        console.log("Product History added: %s", p.history[p.historySize].hash);
    }

    function getProduct(string memory _serialNumber) public view returns (string memory, ProductHistory[] memory) {
        ProductHistory[] memory pHistory = new ProductHistory[](products[_serialNumber].historySize);

        for (uint i = 0; i < products[_serialNumber].historySize ; i++) {
            pHistory[i] = products[_serialNumber].history[i+1];            
        }

        return (products[_serialNumber].serialNumber, pHistory);
    }
}

    // function registerProduct(string memory _name, string memory _brand, string memory _serialNumber, string memory _description, string memory _image,  string memory _actor, string memory _location, string memory _timestamp) public {
    //     Product storage p = products[_serialNumber];

    //     p.name = _name;
    //     p.brand = _brand;
    //     p.serialNumber = _serialNumber;
    //     p.description = _description;
    //     p.image = _image;
    //     p.historySize = 0;

    //     addProductHistory(_serialNumber,_actor, _location, _timestamp, false);
    // }

    // function addProductHistory(string memory _serialNumber, string memory _actor, string memory _location, string memory _timestamp, bool _isSold) public {
    //     Product storage p = products[_serialNumber];
    //     p.historySize++;
    //     p.history[p.historySize] = ProductHistory(p.historySize, _actor, _location, _timestamp, _isSold);

    //     console.log("i1: %s", p.historySize);
    //     console.log("Product History added: %s", p.history[p.historySize].actor);
    //     console.log("Product : %s", p.name);
    // }

    // function getProduct(string memory _serialNumber) public view returns (string memory, string memory, string memory, string memory, string memory, ProductHistory[] memory) {
    //     ProductHistory[] memory pHistory = new ProductHistory[](products[_serialNumber].historySize);

    //     for (uint i = 0; i < products[_serialNumber].historySize ; i++) {
    //         pHistory[i] = products[_serialNumber].history[i+1];            

    //     }

    //     return (products[_serialNumber].serialNumber, products[_serialNumber].name, products[_serialNumber].brand,products[_serialNumber].description, products[_serialNumber].image, pHistory);
    // }


    