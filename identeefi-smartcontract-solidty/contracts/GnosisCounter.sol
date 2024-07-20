// // SPDX-License-Identifier: Unlicense
// pragma solidity 0.8.17;

// import "hardhat/console.sol";
// import "./GnosisSafe.sol";

// error NotAnOwner();
// contract GnosisCounter {
//     address public owner; //admin
//     GnosisSafe public gnosisSafe;

//     struct Product {
//         string name;
//         string serialNumber;
//         string description;
//         string brand;
//         string image;
//         mapping(uint => ProductHistory) history;
//         uint historySize;
//     }

//     mapping(string => Product) products;
//     mapping(uint => ProductHistory) history;    

//     struct ProductHistory {
//         uint id;
//         string actor;
//         string location;
//         string timestamp;
//         bool isSold;
//     }

//     modifier onlyOwner() {
//      if(msg.sender != owner){
//         revert NotOwner();
//      }
//      _;
//     }

//     constructor( address _gnosisSafeAddress){
//         owner = msg.sender;
//         gnosisSafe = _gnosisSafeAddress;
//     }
//     //manufacurer invoke
//     function registerProduct(string memory _name, string memory _brand, string memory _serialNumber, string memory _description, string memory _image,  string memory _actor, string memory _location, string memory _timestamp) public {
//         Product storage p = products[_serialNumber];

//         p.name = _name;
//         p.brand = _brand;
//         p.serialNumber = _serialNumber;
//         p.description = _description;
//         p.image = _image;
//         p.historySize = 0;

//         addProductHistory(_serialNumber,_actor, _location, _timestamp, false);
//     }
//    //retialer will invoke
//         function addProductHistory(string memory _serialNumber, string memory _actor, string memory _location, string memory _timestamp, bool _isSold) public {
//         // Create transaction data for Gnosis Safe
//         bytes memory data = abi.encodeWithSignature(
//             "executeAddProductHistory(string,string,string,string,bool)",
//             _serialNumber, _actor, _location, _timestamp, _isSold
//         );

//         // Execute transaction via Gnosis Safe
//         gnosisSafe.executeTransaction(
//             address(this),
//             0,
//             data,
//             GnosisSafe.Operation.Call,
//             new uint8 , // v
//             new bytes32 , // r
//             new bytes32 , // s
//             new address , // owners
//             new uint256   // indices
//         );
//     }

        


//     function executeAddProductHistory(string memory _serialNumber, string memory _actor, string memory _location, string memory _timestamp, bool _isSold) public onlyOwner {
//         Product storage p = products[_serialNumber];
//         p.historySize++;
//         p.history[p.historySize] = ProductHistory(p.historySize, _actor, _location, _timestamp, _isSold);

//         console.log("i1: %s", p.historySize);
//         console.log("Product History added: %s", p.history[p.historySize].actor);
//         console.log("Product : %s", p.name);
//     }
//     function getProduct(string memory _serialNumber) public view returns (string memory, string memory, string memory, string memory, string memory, ProductHistory[] memory) {
//         ProductHistory[] memory pHistory = new ProductHistory[](products[_serialNumber].historySize);

//         for (uint i = 0; i < products[_serialNumber].historySize ; i++) {
//             pHistory[i] = products[_serialNumber].history[i+1];            

//         }

//         return (products[_serialNumber].serialNumber, products[_serialNumber].name, products[_serialNumber].brand,products[_serialNumber].description, products[_serialNumber].image, pHistory);
//     }

// }
    