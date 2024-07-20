// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";
// import {GnosisSafe} from "./GnosisSafe.sol";
// import {IGnosisSafe} from "./interface/IGnosisSafe.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CounterField is Ownable {
    
    event ProductRegistered(string serialNumber);
    event ProductApproved(string serialNumber);
    // IGnosisSafe _IGnosisSafe;
    // address public owner;
    address public gnosisSafe;
address signer;
    struct Product {
        string serialNumber;
        string name;
        string description;
        string brand;
        string image;

        mapping(uint => ProductHistory) history;
        uint historySize;
    }

    mapping(string => Product) products;

    // struct ProductHistory {
        

    //     uint id;
    //      string serialNumber;
    //     string hash;
    //     string location;
    //     uint256 timestamp;
    //     bool isSold;
    // }
    struct ProductHistory {
        uint id;
        string actor;
        string location;
        uint256 timestamp;
        bool isSold;
    }

struct ProductView {
        string serialNumber;
        string name;
        string description;
        string brand;
        string image;
        ProductHistory[] history;
    }

    struct PendingProduct {
        string serialNumber;
        string actor;
        uint256 timestamp;
        bool isApproved;
    }
    mapping(string => PendingProduct) pendingProducts;

    constructor() {
      
           signer = owner();
    }

    function registerProduct(
       string memory _name, string memory _brand, string memory _serialNumber, string memory _description, string memory _image,  string memory _actor, string memory _location,
        uint256 _increaseTimeStamp,
        bytes calldata signature
    ) public returns (bool) {
        require(
            block.timestamp != _increaseTimeStamp,
            "registerProduct: Increase timestamp shouldn't be equal to block.timestamp"
        );

    //   bytes32[] memory r;
    //     bytes32[] memory s;
    //     uint8[] memory v;
        address[] memory owners = new address[](1);
        owners[0] = signer;
        uint256[] memory indices = new uint256[](1);
        indices[0] = 0;
    string memory serialNumber =_serialNumber;
        bytes32 message = keccak256(abi.encode(_serialNumber));
    
        _validate(signature, message, signer);

 

        // assembly {
            
        //     let signaturePtr := mload(0x40)

        //     // Copy the signature data from calldata to memory
        //     calldatacopy(signaturePtr, 0, 97)

        //     // load the value of the first 32 bytes (r) from the signature in memory
        //     r := mload(add(signaturePtr, 32))

        //     // load the value of the second 32 bytes (s) from the signature in memory
        //     s := mload(add(signaturePtr, 64))

        //     // load the last byte (v) from the signature in memory and convert it to a uint8 value
        //     v := byte(0, mload(add(signaturePtr, 96)))
        // }

        // bytes memory data = abi.encodeWithSignature(
        //     "finalizeProductApproval(string)",
        //     _serialNumber
        // );
        // bool success = IGnosisSafe(gnosisSafe).executeTransaction(
        //     address(this),
        //     0,
        //     data,
        //     0,
        //     v,
        //     r,
        //     s,
        //     owners,
        //     indices
        // );

        // require(success, "Gnosis Safe transaction failed");
       Product storage p = products[serialNumber];

        p.name = _name;
        p.brand = _brand;
        p.serialNumber = _serialNumber;
        p.description = _description;
        p.image = _image;
        p.historySize = 0;
      


        PendingProduct storage q = pendingProducts[_serialNumber];

        q.serialNumber = _serialNumber;
        q.actor = _actor;
        q.timestamp = _increaseTimeStamp;
        q.isApproved = true;
       

        addProductHistory(_serialNumber,_actor, _location, _increaseTimeStamp, false);


        emit ProductRegistered(_serialNumber);
        return true;
    }


    // function finalizeProductApproval(string memory _serialNumber) public {
    //     require(
    //         msg.sender == gnosisSafe,
    //         "Unauthorized: Only Gnosis Safe can call this function"
    //     );
    //     PendingProduct storage pendingProduct = pendingProducts[_serialNumber];
    //     require(
    //         bytes(pendingProduct.serialNumber).length != 0,
    //         "Product not found"
    //     );
    //     require(!pendingProduct.isApproved, "Product already approved");

    //     pendingProduct.isApproved = true;

    //     Product storage p = products[_serialNumber];
    //     p.serialNumber = _serialNumber;
    //     p.historySize = 0;

    //     addProductHistory(
    //         _serialNumber,
    //         pendingProduct.hash,
    //         pendingProduct.timestamp,
    //         false
    //     );

    //     emit ProductApproved(_serialNumber);
    // }

    function addProductHistory(
        string memory _serialNumber,
        string memory _actor,
        string memory _location,
        uint256 _timestamp,
        bool _isSold
    ) public {
        require(
             pendingProducts[_serialNumber].isApproved,
            "Unable To add Product, product is not approved"
        );

        Product storage p = products[_serialNumber];
        p.historySize++;
        // p.serialNumber = _serialNumber;
        p.history[p.historySize] = ProductHistory(
         
            p.historySize,
            _actor,
            _location,
            _timestamp,
            _isSold
        );

        console.log("Product History added: %s", p.history[p.historySize].actor);
        console.log('serial number',p.serialNumber);
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
  
        return (products[_serialNumber].serialNumber, pHistory );
    }

function getProductTest(
        string memory _serialNumber
    ) public view returns (ProductView memory) {
        Product storage product = products[_serialNumber];
        ProductHistory[] memory pHistory = new ProductHistory[](product.historySize);

        for (uint i = 0; i < product.historySize; i++) {
            pHistory[i] = product.history[i + 1];
        }

        return ProductView(
            product.serialNumber,
            product.name,
            product.description,
            product.brand,
            product.image,
            pHistory
        );
    }
    function _validate(
        bytes calldata signature,
        bytes32 encodeData, //message
        address _signer
    ) internal view {
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", getDomainSeparator(), encodeData)
        );
        address recoveredAddress = ECDSA.recover(digest, signature);
//         console.log("In contract----");
//        console.logBytes32(getDomainSeparator());
//         console.logBytes32(digest);
//         console.logBytes(signature);
//        console.log("message"); console.logBytes32(encodeData);
//    console.log(_signer, recoveredAddress);
//         console.log("In contract----");

        // Explicitly disallow authorizations for address(0) as ecrecover returns address(0) on malformed messages
        require(
            recoveredAddress != address(0) && (recoveredAddress == _signer),
            "INVALID_SIGNATURE"
        );
    }

    function getDomainSeparator() internal view returns (bytes32) {
        return keccak256(abi.encode("0x01", address(this)));
    }
}

    //new function added
    // function apporoveProduct(
    //     string memory _serialNumber,
    //     uint8[] memory v,
    //     bytes32[] memory r,
    //     bytes32[] memory s,
    //     address[] memory owners,
    //     uint256[] memory indices
    // ) public onlyOwner {
    //     PendingProduct storage pendingProduct = pendingProducts[_serialNumber];
    //     require(
    //         bytes(pendingProduct.serialNumber).length != 0,
    //         "Product not found"
    //     );
    //     require(!pendingProduct.isApproved, "Product already approved");

    //     //approve tx
    //     bytes memory data = abi.encodeWithSignature(
    //         "finalizeProductApproval(string)",
    //         _serialNumber
    //     );
    //     bool success = IGnosisSafe(gnosisSafe).executeTransaction(
    //         address(this),
    //         0,
    //         data,
    //         0,
    //         v,
    //         r,
    //         s,
    //         owners,
    //         indices
    //     );

    //     require(success, "Gnosis Safe transaction failed");
    // }
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
