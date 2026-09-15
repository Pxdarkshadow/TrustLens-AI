# Migration Status — Identefi → TrustLens AI

Status of each migration work item. Legend: ✅ done & runnable · 🔶 partial/planned · ⬜ not started.

## Summary

The core anti-counterfeit flow (auth, RBAC, product registration, supply-chain tracking, QR verification, consumer product view) is migrated and **runnable end-to-end** on two services: a NestJS+SQLite backend and a React admin web frontend. A FastAPI intelligence skeleton is up. Blockchain (Fabric), MinIO storage, PostgreSQL production DB, and the consumer mobile app are reserved for later phases — the codebase is structured so these plug in without rework.

## Features

| Legacy capability | New home | Status |
|---|---|---|
| User authentication | `services/api` auth module (JWT + bcryptjs) | ✅ |
| Role-based access (admin/manu/supplier/retailer) | auth `@Roles` guard | ✅ |
| User / profile management | `users`, `profiles` modules | ✅ |
| Product registration | `products` module (multipart + image) | ✅ |
| Product metadata + image handling | `product_images`, served statically | ✅ |
| Supply-chain history (handoffs, sold status) | `supply_chain_events` | ✅ |
| QR generation | `qrcode` lib → PNG + download | ✅ |
| QR scanning (consumer) | admin-web Scanner page (`html5-qrcode`) | ✅ |
| Product verification | `POST /products/{serial}/verify` (public) | ✅ |
| Consumer product information view | ProductView / Authentic / Fake pages | ✅ |
| Blockchain-backed records | `BlockchainService` stub (Fabric seam) | 🔶 stub — swap for Fabric |
| Intelligence / AI scoring / KDD | `services/intelligence` skeleton | 🔶 skeleton only |

## Architecture targets

| Target | Directory | Status |
|---|---|---|
| React + TS admin web | `apps/admin-web` | ✅ |
| NestJS + TS backend | `services/api` | ✅ (SQLite for dev) |
| FastAPI intelligence service | `services/intelligence` | ✅ (skeleton) |
| PostgreSQL | `infrastructure/postgres` | 🔶 prod target — dev/CI uses SQLite |
| MinIO / S3 storage | `infrastructure/storage` | ⬜ seams ready |
| Hyperledger Fabric | `infrastructure/hyperledger-fabric` | ⬜ seam ready in `BlockchainService` |
| Consumer mobile (Expo) | `apps/consumer-mobile` | ⬜ API contract settled |
| Dockerized local dev | `docker-compose.yml` (root) | 🔶 template — runnable, not required |

## Security fixes over legacy

- ❌→✅ hardcoded Pinata/Google/Web3Modal/contract secrets removed (env vars only)
- ❌→✅ plaintext passwords → bcryptjs hashing; never sent in URL path
- ❌→✅ SQL string interpolation → parameterized statements
- ❌→✅ client-side route "auth" → server-side JWT + RBAC guards
- ❌→✅ QR codelocked to `CONTRACT,SERIAL` → backend-identified `trustlens://verify/{serial}`

## Known issues / future work

1. Legacy `identeefi-*` dirs intentionally untouched (reference). Old repo had tracked `node_modules` (1422 files) — new work uses root `.gitignore`.
2. Contract ABI mismatch and inverted expiry logic in legacy `Identeefi.sol` deliberately not ported.
3. Postgres: port the schema in `services/api/src/database.js` to `infrastructure/postgres/migrations` when a PG instance is available.
4. Add signed verification + per-role access control at the Fabric layer when implemented.
5. `docker-compose.yml` groups the future PG/MinIO stack; not needed for local SQLite dev.