// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import {GnosisSafe} from "./GnosisSafe.sol";
// import {IGnosisSafe} from "./interface/IGnosisSafe.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

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
contract Identeefi is Ownable {
    event ProductRegistered(string serialNumber);
    event ProductApproved(string serialNumber);
    // IGnosisSafe _IGnosisSafe;
    // address public owner;
    address public gnosisSafe;

    struct Product {
        string serialNumber;
        mapping(uint => ProductHistory) history;
        uint historySize;
    }

    mapping(string => Product) products;

    struct ProductHistory {
        uint id;
        string hash;
        uint256 timestamp;
        bool isSold;
    }

    struct PendingProduct {
        string serialNumber;
        string hash;
        uint256 timestamp;
        bool isApproved;
    }
    mapping(string => PendingProduct) pendingProducts;

    constructor(address _gnosisSafe)  {
        
         gnosisSafe = _gnosisSafe;
    }

    function registerProduct(
        string memory _serialNumber,
        string memory _hash,
        uint256 _increaseTimeStamp
    ) public returns (bool) {
        require(
            block.timestamp != _increaseTimeStamp,
            "registerProduct: Increase timestamp shouldn't be equal to block.timestamp"
        );

        PendingProduct storage p = pendingProducts[_serialNumber];

        p.serialNumber = _serialNumber;
        p.hash = _hash;
        p.timestamp = _increaseTimeStamp;
        p.isApproved = false;
        // p.historySize = 0;

        addProductHistory(_serialNumber, _hash, _increaseTimeStamp, false);
        emit ProductRegistered(_serialNumber);
        return true;
    }

    //new function added
    function apporoveProduct(
        string memory _serialNumber,
        uint8[] memory v,
        bytes32[] memory r,
        bytes32[] memory s,
        address[] memory owners,
        uint256[] memory indices
    ) public onlyOwner {
        PendingProduct storage pendingProduct = pendingProducts[_serialNumber];
        require(
            bytes(pendingProduct.serialNumber).length != 0,
            "Product not found"
        );
        require(!pendingProduct.isApproved, "Product already approved");

        //approve tx
        bytes memory data = abi.encodeWithSignature(
            "finalizeProductApproval(string)",
            _serialNumber
        );
        bool success = IGnosisSafe(gnosisSafe).executeTransaction(
            address(this),
            0,
            data,
            0,
            v,
            r,
            s,
            owners,
            indices
        );

                require(success, "Gnosis Safe transaction failed");

    }
    function finalizeProductApproval(string memory _serialNumber) public {
        require(msg.sender == gnosisSafe, "Unauthorized: Only Gnosis Safe can call this function");
        PendingProduct storage pendingProduct = pendingProducts[_serialNumber];
        require(bytes(pendingProduct.serialNumber).length != 0,"Product not found");
        require(!pendingProduct.isApproved,"Product already approved");
        
        pendingProduct.isApproved =true;
        
        Product storage p = products[_serialNumber];
        p.serialNumber =_serialNumber;
        p.historySize=0;

        addProductHistory(_serialNumber, pendingProduct.hash, pendingProduct.timestamp, false);

        emit ProductApproved(_serialNumber);
    }


    function addProductHistory(
        string memory _serialNumber,
        string memory _hash,
        uint256 _timestamp,
        bool _isSold
    ) public {
    require(pendingProducts[_serialNumber].isApproved, "Unable To add Product, product is not approved");

        Product storage p = products[_serialNumber];
        p.historySize++;
        p.history[p.historySize] = ProductHistory(
            p.historySize,
            _hash,
            _timestamp,
            _isSold
        );

        console.log("Product History added: %s", p.history[p.historySize].hash);
    }

    function getProduct(
        string memory _serialNumber
    ) public view returns (string memory, ProductHistory[] memory) {
        ProductHistory[] memory pHistory = new ProductHistory[](
            products[_serialNumber].historySize
        );

        for (uint i = 0; i < products[_serialNumber].historySize; i++) {
            pHistory[i] = products[_serialNumber].history[i + 1];
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
