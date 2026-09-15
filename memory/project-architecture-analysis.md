---
name: project-architecture-analysis
description: Comprehensive architecture analysis of TrustLens-AI anti-counterfeit system
metadata:
  type: project
---

# TrustLens-AI Anti-Counterfeit Product Identification System - Architecture Analysis

## System Overview
This is an anti-counterfeit product identification system using blockchain technology. It combines QR codes, smart contracts, PostgreSQL database, and a React frontend to provide a secure and transparent platform for tracking and verifying product authenticity across the supply chain.

## Architecture Components

### 1. Frontend (identeefi-frontend-react)
**Technology Stack:**
- React 18.2.0 with react-scripts 5.0.1
- Material-UI (MUI) v5 for UI components
- Redux Toolkit for state management
- React Router v6 for routing
- ethers.js v5.7.2 for Ethereum blockchain interaction
- wagmi v2.8.6 + @web3modal/wagmi for wallet connections
- QR code scanning: react-qr-reader, qrcode.react
- IPFS integration: @pinata/sdk, @chris.troutner/ipfs-http-client
- Geocoding: react-geocode

**Key Pages/Routes:**
- `/` - Home page
- `/login` - Authentication page
- `/scanner` - QR code scanner
- `/product` - Product details (consumer view)
- `/authentic-product` - Authentic product confirmation
- `/fake-product` - Counterfeit product warning
- `/admin` - Admin dashboard
- `/manufacturer` - Manufacturer dashboard
- `/supplier` - Supplier dashboard
- `/retailer` - Retailer dashboard
- `/add-product` - Manufacturer product registration
- `/update-product` - Scan to update product
- `/update-product-details` - Add history to product
- `/profile` - User profile

**Role-based Access Control:**
- Admin: Full access to admin, add-account, manage-account
- Manufacturer: Add products, view profile
- Supplier: Update products (scan + add history), view profile
- Retailer: Update products (scan + add history), view profile, mark products as sold

### 2. Backend (identeefi-backend-node)
**Technology Stack:**
- Node.js with Express.js
- PostgreSQL database (pg driver)
- bcrypt for password hashing
- multer for file uploads
- CORS enabled

**API Endpoints:**
- `GET /authAll` - Get all users
- `POST /auth/:username/:password` - Login (with bcrypt)
- `POST /addaccount` - Create new account
- `POST /changepsw` - Change password
- `GET /profileAll` - Get all profiles
- `GET /profile/:username` - Get user profile
- `POST /addprofile` - Create user profile
- `POST /upload/profile` - Upload profile image
- `POST /upload/product` - Upload product image
- `GET /file/profile/:fileName` - Serve profile images
- `GET /file/product/:fileName` - Serve product images
- `GET /product/serialNumber` - Get all serial numbers
- `POST /addproduct` - Add product to database

**Database Tables:**
- `auth` - User authentication (username, password, role)
- `profile` - User profiles (name, description, website, location, image, role)
- `product` - Products (name, serialNumber, brand)

### 3. Smart Contract (identeefi-smartcontract-solidty)
**Technology Stack:**
- Solidity ^0.8.17
- Hardhat for development/testing
- Deployed on Vanar Vanguard testnet (chainId: 78600 / 0x13308)
- Contract address: `0x0C778A1762BEb8878947E56966E56EC8F476ebAc`

**Contract: Identeefi.sol**

**Data Structures:**
```solidity
struct ProductHistory {
    uint id;
    string actor;
    string location;
    uint256 initialize_timestamp;
    uint256 expire_timestamp;
    bool isSold;
}

struct Product {
    string name;
    string serialNumber;
    string description;
    string brand;
    string image;
    mapping(uint => ProductHistory) history;
    uint historySize;
}
```

**State Variables:**
- `mapping(string => Product) products` - Products by serial number
- `mapping(uint => ProductHistory) history` - Global history

**Events:**
- `ProductRegistered` - Emitted when product is registered
- `ProductHistoryAdded` - Emitted when history is added

**Functions:**
1. `registerProduct(name, brand, serialNumber, description, image, actor, location, expire_timestamp)` - Manufacturer registers new product
2. `addProductHistory(serialNumber, actor, location, initialize_timestamp, expire_timestamp, isSold)` - Supplier/Retailer adds supply chain history
3. `getProduct(serialNumber)` - Returns product details and history

**Errors:**
- `ProductHasSameRegisterAndExpiry()` - Timestamp validation
- `ProductIsExpired()` - Product expired check

### 4. PostgreSQL Database (identeefi-postgres-database)
**Tables:**
1. `auth` - username (PK), password, id, role
2. `profile` - id (PK), name, description, username, website, location, image, role
3. `product` - serialNumber (PK), name, brand

**Sample Data:**
- Users: admin/admin, supp/supp (supplier), manu/manu (manufacturer), retailer/retailer (retailer)
- Profiles: Manu Group, CK Supplier, RE retailer
- Products: Multiple Chanel handbags with serial numbers

### 5. QR Code Verification Flow
1. QR code contains: `CONTRACT_ADDRESS,SERIAL_NUMBER`
2. Scanner reads QR, parses contract address
3. Validates contract address matches expected address
4. Routes based on user role:
   - Supplier/Retailer → `/update-product` (add history)
   - Consumer → `/authentic-product` → `/product` (view details)
   - Invalid contract → `/fake-product`

### 6. Blockchain Interaction
- Uses ethers.js v5 with Web3Provider
- Connects to MetaMask/WalletConnect
- Transactions signed by user wallet
- Reads via `getProduct()` view function
- Writes via `registerProduct()` and `addProductHistory()`

### 7. IPFS Integration (Pinata)
- Product images uploaded to IPFS via Pinata API
- Metadata (name, brand, serial, description, image, manufacturer info) stored as JSON on IPFS
- Returns IPFS gateway URL for retrieval

## Complete Product Flow: Registration → Consumer Verification

### Phase 1: Manufacturer Registration
1. Manufacturer logs in → `/manufacturer` dashboard
2. Clicks "Add Product" → `/add-product`
3. Fills form: serialNumber, name, brand, description, image
4. Frontend gets current GPS location & timestamp
5. Image uploaded to Pinata IPFS → returns IPFS URL
6. Metadata JSON created & uploaded to Pinata IPFS
7. QR code generated: `CONTRACT_ADDRESS,SERIAL_NUMBER`
8. User clicks "Add Product" → triggers blockchain transaction
9. `registerProduct()` called on smart contract with all details
10. Product stored on blockchain with initial history entry (manufacturer as actor)
11. Product also added to PostgreSQL database
12. QR code downloaded and printed on physical product

### Phase 2: Supply Chain Updates
1. Supplier/Retailer logs in → dashboard
2. Clicks "Update Product" → `/scanner`
3. Scans QR code on product
4. Validates contract address matches
5. Routes to `/update-product` with QR data in state
6. Parses serial number from QR data
7. Goes to `/update-product-details`
8. Auto-fills: current user name, GPS location, timestamp
9. Retailer can mark "Is Sold" = true
10. Clicks "Update Product" → blockchain transaction
11. `addProductHistory()` called on smart contract
12. New history entry added with actor, location, timestamp, isSold flag

### Phase 3: Consumer Verification
1. Consumer visits `/scanner` (no login required)
2. Scans QR code on product
3. Validates contract address
4. If valid → `/authentic-product` → "Connect Wallet" → `/product`
5. If invalid contract address → `/fake-product` (counterfeit warning)
6. On `/product` page:
   - Fetches product from blockchain via `getProduct(serialNumber)`
   - Displays: name, serial, description, brand, image
   - Shows timeline of all supply chain history (location, actor, timestamp)
   - Shows "IsSold" status

## Technologies Summary

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, MUI v5, Redux Toolkit, React Router v6, ethers.js v5, wagmi v2, @web3modal/wagmi |
| Backend | Node.js, Express.js, PostgreSQL (pg), bcrypt, multer |
| Blockchain | Solidity ^0.8.17, Hardhat, Vanar Vanguard testnet |
| Storage | Pinata IPFS (images + metadata) |
| QR/Scanner | react-qr-reader, qrcode.react |
| Maps | react-geocode (Google Maps API) |
| Auth | JWT-like session in React context, bcrypt on backend |

## Currently Implemented Features

### ✅ Working Features:
1. **User Authentication** - Login with username/password, role-based routing
2. **Role-based Dashboards** - Admin, Manufacturer, Supplier, Retailer
3. **Product Registration** - Manufacturer adds products with images, metadata to IPFS, blockchain registration
4. **QR Code Generation** - Contains contract address + serial number
5. **QR Code Scanning** - Camera-based scanning via react-qr-reader
6. **Supply Chain Tracking** - Supplier/Retailer add history entries with location, timestamp
7. **Blockchain Verification** - Consumer scans QR, verifies on blockchain
8. **Product History Timeline** - Visual timeline of all supply chain events
9. **Counterfeit Detection** - Invalid contract address triggers fake product warning
10. **Profile Management** - User profiles with images stored on backend
11. **Wallet Integration** - MetaMask + WalletConnect via wagmi/web3modal
12. **IPFS Storage** - Images and metadata on Pinata IPFS
13. **Geolocation** - Automatic GPS capture for manufacturing/supply chain locations

### ❌ Not Implemented / Limitations:
1. **No Admin Dashboard Functionality** - Admin routes exist but pages are minimal
2. **No Real-time Updates** - No WebSocket/polling for live updates
3. **No Batch Operations** - Single product registration only
4. **No Analytics/Dashboard** - No charts, metrics, or reporting
5. **No Product Search** - Can only find products via QR scan
6. **No Offline Support** - Requires internet for blockchain/IPFS
7. **No Multi-language Support** - English only
8. **No Advanced Access Control** - Simple role-based, no granular permissions
9. **No Audit Logging** - No separate audit trail beyond blockchain
10. **No Mobile App** - Web-only, responsive but not native
11. **No Email Notifications** - No alerts for supply chain events
12. **No Integration APIs** - No REST API for external systems
13. **Smart Contract Limitations:**
    - No ownership transfer mechanism
    - No product deactivation/revocation
    - No batch/bulk registration
    - Simple timestamp validation (bug: compares block.timestamp with block.timestamp + expire_timestamp)
    - `getProduct` reverts if ANY history entry is expired (should only check latest)
14. **Security Concerns:**
    - Passwords sent in URL params (POST /auth/:username/:password)
    - No rate limiting on auth endpoints
    - Hardcoded API keys in frontend (Pinata, Google Maps)
    - No input sanitization on backend
    - Contract address hardcoded in multiple frontend files
15. **Database Issues:**
    - No foreign key relationships
    - Serial number as primary key but auto-generated from sequence
    - No indexes on frequently queried columns
16. **No Tests** - Frontend has no tests, backend has no tests, smart contract has minimal test

## Known Bugs/Issues in Code

1. **Smart Contract Bug** (Identeefi.sol:56): `if (block.timestamp >= (block.timestamp + _expire_timestamp))` - This will always be false since _expire_timestamp > 0, making the check useless
2. **Smart Contract Bug** (Identeefi.sol:107): `getProduct` reverts if ANY history entry is expired - should only check the latest/current entry
3. **Backend Auth Bug** (postgres.js:103): SQL injection vulnerability - using string interpolation instead of parameterized query
4. **Backend Auth Bug** (postgres.js:108): Hashes the provided password instead of comparing with stored hash
5. **Frontend Hardcoded Values** - Contract address, API keys, chain configs repeated in multiple files
6. **IPFS API Keys Exposed** - Pinata API keys hardcoded in AddProduct.jsx

## Deployment Configuration
- Backend: Port 5000, PostgreSQL on localhost:5432
- Frontend: React dev server (port 3000)
- Blockchain: Vanar Vanguard testnet (RPC: https://rpc-vanguard.vanarchain.com)
- Smart Contract: 0x0C778A1762BEb8878947E56966E56EC8F476ebAc
- IPFS: Pinata (gateway: aquamarine-accessible-takin-121.mypinata.cloud)