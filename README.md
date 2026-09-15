# TrustLens AI — Anti-Counterfeit Product Identification System

Blockchain-backed product authentication with QR verification and supply-chain provenance tracking. Migrated from the legacy **Identefi** (Ethereum + Express + plaintext secrets) into the TrustLens AI monorepo architecture.

## Architecture

```text
TrustLens AI
├── apps/
│   └── admin-web/          React + TypeScript + Vite + MUI  (business/admin portal)
├── services/
│   ├── api/                NestJS + TypeScript + SQLite      (main orchestration backend, :3001)
│   └── intelligence/       Python FastAPI                    (AI service SKELETON, :8000)
├── infrastructure/         (planned — see ARCHITECTURE.md)
│   ├── postgres/           PostgreSQL                         (production DB)
│   ├── hyperledger-fabric/ Provenance chaincode               (blockchain layer)
│   └── storage/            MinIO / S3-compatible              (object storage)
├── identeefi-*             (legacy reference — do not modify)
└── memory/                 (migration notes + design docs)
```

## Quick Start

Requirements: Node.js 20+ and Python 3.12+. No Docker or PostgreSQL needed for local dev — the backend uses Node's built-in SQLite.

### 1. Backend (`services/api`)

```bash
cd services/api
npm install
npm run build
node dist/main.js
```
Serves on `http://localhost:3001/api`. Seeds admin `admin/admin`, `manu/manu`, `supp/supp`, `retailer/retailer` plus sample products on first boot. Use `cp .env.example .env` to override defaults.

### 2. Frontend (`apps/admin-web`)

```bash
cd apps/admin-web
npm install
npm run dev
```
Serves on `http://localhost:5173` (Vite auto-proxies `/api` to `:3001`). Log in with any seeded account.

### 3. Intelligence service (`services/intelligence`)

```bash
cd services/intelligence
python -m venv .venv
.venv\Scripts\activate          # Windows; on macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
.venv\Scripts\python -m uvicorn main:app --port 8000
```
Health: `http://127.0.0.1:8000/health`. Skeleton only — no AI features in this phase.

## Roles & Flow

| Role | Capabilities |
|------|-------------|
| admin | Manage users & accounts, view everything |
| manufacturer | Register products, generate QR codes |
| supplier | Record supply-chain handoffs |
| retailer | Record handoffs + mark products sold |
| consumer (frontend only) | Scan QR / verify product authenticity |

`register product → generate QR → supplier handoff → retailer marks sold → consumer scans QR → verify + view provenance`

## Docs

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — design, module map, blockchain seam, future modules
- [`MIGRATION_STATUS.md`](MIGRATION_STATUS.md) — what's migrated vs planned
- Legacy references preserved under `identeefi-*` for comparison.

## Legacy

The original Ethereum-based system (Solidity/Hardhat contract on Vanar Vanguard, Express backend, plaintext Postgres) is preserved under `identeefi-*`. It is **not** the active stack. Known legacy issues (hardcoded API keys, plaintext passwords, uninverted contract expiry logic) are deliberately not carried forward.