# TrustLens AI — Phase 1: Technology Stack Migration

You are working on an existing project originally called Identefi, an anti-counterfeit product identification system using QR codes, blockchain, PostgreSQL, and a React frontend.

Your task is to perform a controlled migration of the existing codebase into the target TrustLens AI technology architecture.

## IMPORTANT RULES

Before modifying anything:

1. Thoroughly inspect the entire existing repository.
2. Preserve the existing repository as the functional reference implementation.
3. Do not remove functionality unless it is intentionally replaced by an equivalent or improved implementation.
4. Do not implement the AI TrustLens validation engine yet.
5. Do not implement web scraping, review analysis, recommendation systems, KDD algorithms, or trust scoring yet.
6. This phase is ONLY about establishing the correct technology architecture and migrating the existing anti-counterfeit functionality.
7. Fix critical security and architecture issues encountered during migration where necessary.
8. Work incrementally and ensure each major component is functional before moving forward.
9. Do not create unnecessary features or add technologies that are not part of the target architecture.
10. Before deleting or replacing an existing component, understand exactly what functionality it currently provides.

---

# TARGET ARCHITECTURE

The final project should use the following architecture:

```text
TrustLens AI
│
├── apps/
│   ├── consumer-mobile/        React Native + Expo + TypeScript
│   └── admin-web/              React + TypeScript
│
├── services/
│   ├── api/                    NestJS + Node.js + TypeScript
│   └── intelligence/           Python + FastAPI
│
├── infrastructure/
│   ├── postgres/
│   ├── hyperledger-fabric/
│   └── storage/
│
└── shared/
    └── shared types/contracts where appropriate
```

The architecture should support these future TrustLens AI modules:

1. Product Data Module
2. AI Product Intelligence Engine
3. Knowledge Discovery and Data Mining Analytics Engine
4. Blockchain Verification Layer
5. Consumer Portal

However, ONLY migrate the technology architecture and existing functionality in this phase.

Do not implement future AI/KDD features yet.

---

# CURRENT FUNCTIONALITY THAT MUST BE UNDERSTOOD AND PRESERVED

The existing system currently supports:

- User authentication
- Role-based access:
  - Admin
  - Manufacturer
  - Supplier
  - Retailer
- User profiles
- Product registration
- Product image handling
- Product metadata
- QR code generation
- QR code scanning
- Product verification
- Supply-chain history
- Manufacturer → Supplier → Retailer tracking
- Product sold status
- Geolocation capture
- Blockchain-backed product records
- Consumer product information view

The existing product flow is conceptually:

```text
Manufacturer
    ↓
Register Product
    ↓
Store Product Information
    ↓
Register Provenance Record
    ↓
Generate QR Code
    ↓
Supplier Updates History
    ↓
Retailer Updates History
    ↓
Consumer Scans QR
    ↓
Verify Product
    ↓
View Product Information + Provenance
```

Preserve this functional flow while replacing the underlying technology where required.

---

# 1. ADMIN / BUSINESS WEB APPLICATION

Target:

- React
- TypeScript

Location:

```text
apps/admin-web/
```

This application should eventually serve:

- Admin
- Manufacturer
- Supplier
- Retailer

Migrate the relevant functionality from the existing React frontend.

Preserve existing functional capabilities such as:

- Login
- Role-based navigation
- Manufacturer dashboard
- Supplier dashboard
- Retailer dashboard
- Admin functionality
- Product registration
- Supply-chain updates
- QR generation
- Profile management

Clean up the architecture during migration.

Do not carry forward:

- Duplicate wallet integration systems
- Unnecessary blockchain wallet requirements for ordinary application users
- Hardcoded secrets
- Repeated hardcoded contract addresses

The web application should communicate with the backend API rather than directly containing business logic that belongs on the server.

---

# 2. CONSUMER MOBILE APPLICATION

Target:

- React Native
- Expo
- TypeScript

Location:

```text
apps/consumer-mobile/
```

Create the initial mobile application architecture.

For this migration phase, implement only the existing consumer functionality where practical:

- QR scanning
- Sending QR/product identity to the backend verification API
- Receiving verification results
- Viewing product details
- Viewing product provenance/history
- Counterfeit/invalid product result screen

The consumer must NOT be required to:

- Install MetaMask
- Connect a cryptocurrency wallet
- Interact directly with blockchain infrastructure

Blockchain interaction must be handled through the backend.

Do not implement TrustLens AI scoring yet.

For now, the consumer application should establish the correct architecture for future:

- Trust scores
- AI explanations
- Risk analysis
- Personalized recommendations

---

# 3. MAIN BACKEND API

Replace the existing Express backend with:

- Node.js
- TypeScript
- NestJS

Location:

```text
services/api/
```

The NestJS API should become the main orchestration layer.

It should be responsible for:

- Authentication
- Authorization
- RBAC
- User management
- Profile management
- Product management
- QR generation and verification orchestration
- Supply-chain operations
- PostgreSQL access
- Blockchain communication
- Communication with future AI services

Use a clean modular NestJS architecture.

Suggested modules:

```text
src/
├── auth/
├── users/
├── profiles/
├── products/
├── supply-chain/
├── verification/
├── qr/
├── blockchain/
├── storage/
├── common/
└── config/
```

Do not expose passwords in URL parameters.

Use secure authentication practices.

Use:

- Proper password hashing
- JWT-based authentication
- Refresh tokens if appropriate
- Role-based authorization guards
- Environment variables for secrets

Replace unsafe SQL string interpolation with parameterized queries or a suitable ORM/query layer.

Keep PostgreSQL as the primary relational database.

---

# 4. DATABASE

Keep:

- PostgreSQL

Location:

```text
infrastructure/postgres/
```

Do not simply copy the old minimal schema.

Design a clean schema capable of supporting the existing functionality while being extensible for future TrustLens modules.

The schema should support at minimum:

- Users
- Roles
- Profiles
- Products
- Manufacturers
- Supply-chain events
- Product verification records where appropriate
- Product status
- QR/product identifiers

Do NOT implement the full future AI schema yet.

However, design the product model so that future fields/modules can be added without redesigning the entire system.

Use proper:

- Primary keys
- Foreign keys
- Constraints
- Indexes where justified
- Timestamps
- Data integrity rules

Create migrations rather than relying only on manually executed SQL files.

---

# 5. BLOCKCHAIN MIGRATION

The existing system uses:

- Solidity
- Hardhat
- Ethereum-style smart contracts
- Vanar Vanguard testnet
- Wallet-based frontend transactions

Migrate the blockchain verification/provenance layer toward:

- Hyperledger Fabric

Location:

```text
infrastructure/hyperledger-fabric/
```

The Fabric layer should eventually be responsible for:

- Product identity/provenance
- Supply-chain events
- Authorized participant actions
- Product status
- Revocation/deactivation capability
- Tamper-resistant verification records

Do NOT blindly attempt to reproduce Ethereum architecture inside Fabric.

Redesign the blockchain model according to Hyperledger Fabric concepts.

The NestJS backend should communicate with Fabric.

Frontend applications should NOT directly write blockchain transactions.

For this migration phase, focus first on establishing a working local Hyperledger Fabric development environment and a minimal chaincode architecture capable of replacing the existing core provenance functionality.

The core functionality to migrate conceptually is:

```text
Register Product

Add Supply Chain Event

Get Product

Get Product Provenance/History

Verify Product Identity

Deactivate/Revoke Product
```

Ensure that participant authorization can be enforced appropriately.

Do not implement unnecessary blockchain complexity.

---

# 6. STORAGE

Replace the current frontend-exposed Pinata API architecture.

Use an S3-compatible storage abstraction.

For local development, use:

- MinIO

The backend should handle file uploads.

The frontend must never contain storage secrets.

The storage layer should support:

- Product images
- Future certificates
- Future laboratory reports
- Future product documents

Do not implement the certificate/laboratory analysis system yet.

Just establish the correct storage architecture.

Store file metadata/references in PostgreSQL where appropriate.

---

# 7. INTELLIGENCE SERVICE

Create the initial service structure:

```text
services/intelligence/
```

Target:

- Python
- FastAPI

IMPORTANT:

Do not implement AI models yet.

Do not implement:

- Trust scoring
- Review analysis
- Web scraping
- NLP pipelines
- Recommendation engines
- SHAP
- KDD algorithms
- Fraud detection models

For this phase, only establish the service architecture.

The service should:

- Run successfully
- Have health/status endpoints
- Be containerized
- Be callable from the NestJS backend

Create a clean structure that can later contain:

```text
app/
├── api/
├── services/
├── models/
├── pipelines/
├── data/
└── main.py
```

The NestJS backend should be able to communicate with this service, but no intelligence functionality needs to exist yet.

---

# 8. QR VERIFICATION MIGRATION

The existing QR format is:

```text
CONTRACT_ADDRESS,SERIAL_NUMBER
```

Do not continue using this exact architecture.

During this migration, redesign the QR system so that the QR identifies a product through the TrustLens backend rather than exposing blockchain implementation details.

The final QR design should be suitable for a future signed verification mechanism.

For this migration phase, establish a backend-controlled verification flow.

Conceptually:

```text
Physical Product
      ↓
QR Code
      ↓
Consumer Mobile App
      ↓
NestJS Verification API
      ↓
Product Identity / Blockchain Provenance
      ↓
Verification Result
```

Do not implement the future AI trust evaluation yet.

---

# 9. ENVIRONMENT AND SECRET MANAGEMENT

Remove all hardcoded:

- API keys
- Storage credentials
- Database credentials
- Blockchain configuration secrets
- Project IDs

Use environment variables.

Provide:

```text
.env.example
```

for every service/application requiring configuration.

Never commit actual secrets.

---

# 10. CONTAINERIZATION

Use:

- Docker
- Docker Compose

The local development environment should eventually support:

```text
PostgreSQL
MinIO
NestJS API
FastAPI Intelligence Service
Hyperledger Fabric development environment
Admin Web
Consumer Mobile development environment
```

Do not overcomplicate production deployment at this stage.

Focus on a reproducible local development environment.

---

# MIGRATION STRATEGY

Perform this migration incrementally.

## Step A — Repository Assessment

Before modifying code:

1. Map every existing feature.
2. Map every existing dependency.
3. Identify which functionality is migrated to which new component.
4. Identify functionality that will be intentionally removed.
5. Produce a migration plan.

Do not begin destructive changes before completing this assessment.

## Step B — Create Target Project Structure

Create the new architecture alongside the existing implementation where practical.

Do not immediately delete the old code.

## Step C — Infrastructure

Set up:

- PostgreSQL
- MinIO
- Docker environment
- Configuration management

Verify each component independently.

## Step D — NestJS Migration

Migrate backend functionality gradually.

Verify:

- Authentication
- Roles
- Products
- Supply-chain operations

before moving further.

## Step E — Hyperledger Fabric

Set up the Fabric environment.

Implement minimal provenance chaincode.

Verify that the backend can:

- Register a product
- Add an event
- Retrieve provenance

## Step F — Web Application Migration

Migrate business/admin functionality to the new API.

Ensure existing workflows still work.

## Step G — Consumer Mobile Application

Implement the consumer architecture and QR verification flow.

## Step H — Intelligence Service Skeleton

Ensure FastAPI is running and the NestJS backend can communicate with it.

Do not add AI functionality.

---

# VALIDATION REQUIREMENT

After every major migration component, verify that it actually works.

Do not assume successful compilation means successful migration.

Test the complete flow eventually:

```text
1. Create authorized manufacturer
2. Authenticate manufacturer
3. Register product
4. Upload product image
5. Store product data in PostgreSQL
6. Register provenance in Hyperledger Fabric
7. Generate QR code
8. Scan QR from consumer mobile application
9. Verify product through NestJS backend
10. Retrieve provenance/history
11. Display product information
```

---

# DOCUMENTATION REQUIREMENTS

Continuously maintain:

```text
README.md
ARCHITECTURE.md
MIGRATION_STATUS.md
```

Document:

- Current architecture
- Setup instructions
- Environment variables
- Service responsibilities
- API communication
- Database architecture
- Hyperledger Fabric integration
- Migration progress
- Known issues

---

# FINAL OUTPUT FOR THIS PHASE

At the end of this phase, the project should have:

- A clean monorepo/project structure
- React + TypeScript admin/business application
- React Native + Expo consumer application architecture
- NestJS + TypeScript backend
- PostgreSQL database with proper schema/migrations
- MinIO/S3-compatible storage abstraction
- Hyperledger Fabric local development setup
- Minimal working provenance chaincode
- NestJS ↔ Fabric integration
- FastAPI intelligence service skeleton
- Backend-controlled QR verification
- Secure environment variable configuration
- Dockerized local development environment

Most importantly:

The existing anti-counterfeit product registration, provenance tracking, QR verification, and consumer product viewing capabilities should be migrated into the new architecture.

DO NOT implement the advanced TrustLens AI validation system yet.

After completing the repository assessment and migration plan, report the plan and current status before making any destructive or irreversible changes.