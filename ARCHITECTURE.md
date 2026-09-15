# TrustLens AI — Architecture

## Goals

Anti-counterfeit product identification: register a product, issue a QR code, track it through the supply chain (manufacturer → supplier → retailer), and let consumers verify authenticity with a scan. This phase migrates the legacy Ethereum-based system onto a clean monorepo with a real backend; AI/intelligence features are future work whose structure is pre-wired.

## Components

### apps/admin-web (React + TS + Vite + MUI)
Business and admin portal serving all four roles. Talks only to the NestJS API — no direct blockchain or storage access, no client-side secrets.

- **Auth**: JWT access token (`localStorage`) + opaque refresh token; axios interceptor auto-refreshes on 401.
- **Routing**: role-gated by `ProtectedRoute`.
- **Pages**: login, scanner, product view (verification), authentic/fake result, profile, admin (dashboard/accounts), manufacturer (dashboard/add product/my products), supplier (dashboard/update product), retailer.
- **Verification**: `POST /products/{serial}/verify` consumes a QR via `html5-qrcode` (`trustlens://verify/{serial}` format, legacy `CONTRACT,SERIAL` and plain serial still parsed).

### services/api (NestJS + TypeScript + SQLite)
Main orchestration layer. All business logic lives here; the frontend is a thin client.

- `node:sqlite` (`DatabaseSync`) for storage — zero native deps, runs anywhere Node 22+ does. Schema is relational and mirrors the future PostgreSQL schema (see `infrastructure/postgres`). Parameterized statements throughout (fixes legacy SQL-injection-string-interpolation and plaintext-password issues).
- **Auth**: bcryptjs hashing, JWT 15m access + random 7d refresh token (rotating).
- **RBAC**: `JwtAuthGuard` + `@Roles(...)` guard.
- **Modules**: auth, users, profiles, products, blockchain (seam).
- Every response wrapped in `{ success, data|message, timestamp }`; errors in `{ status, message, errors?, path }`.
- **Blockchain seam**: `BlockchainService.registerProduct()/addEvent()` return a local stub `{ transactionHash, blockNumber }`. This is the single integration point for Hyperledger Fabric.

### services/intelligence (Python FastAPI)
Skeleton for the future AI validation engine (Trust scoring, KDD, review analysis). Currently only `/health` + `/status`; directories `app/{api,services,models,pipelines,data}` pre-wired for future modules. NestJS will call it once features exist.

## Data Model

- **users** — id, username (unique), password_hash, role (`admin|manufacturer|supplier|retailer`), timestamps
- **refresh_tokens** — user_id, token, expires_at
- **profiles** — user_id (unique), username, name, description, website, location, image_filename, role
- **products** — serial_number (PK), name, brand, description, manufacturer_name/location, manufacture_date, status (`active|inactive|revoked|sold`), blockchain refs, timestamps
- **product_images** — product, filename, is_primary
- **supply_chain_events** — product, actor, role, location, timestamp, is_sold, blockchain refs

`products` is designed so future TrustLens AI fields (trust scores, risk flags, review refs) attach without a redesign.

## QR Design

QR encodes `trustlens://verify/{serial}?t={ts}` — it identifies a product through the **backend**, not through a blockchain address. This removes the legacy `CONTRACT_ADDRESS,SERIAL` coupling and is compatible with a future signed-verification scheme. Consumers never touch the wallet/chain.

## Future Modules (NOT this phase)

- **Blockchain**: Hyperledger Fabric chaincode replaces `BlockchainService`. Fabric is anonymous/business, not consumer-facing.
- **Storage**: MinIO / S3-compatible backend for images/docs; the `product_images`/`profiles.image_filename` metadata already fits.
- **AI**: trust scoring, risk analysis, KDD analytics inside `services/intelligence`.
- **consumer-mobile**: React Native + Expo app reusing the same verification API.
- **PostgreSQL**: production DB; migrations planned under `infrastructure/postgres` (dev uses SQLite).

## Migration Philosophy

- Frontend never holds secrets or writes chain transactions (legacy leaked Pinata keys, Web3Modal ids, a hardcoded contract address inline).
- Passwords hashed; never sent in URL params (legacy did `POST /auth/:user/:pwd`).
- Old contract's inverted expiry check and missing access control are intentionally not reproduced.