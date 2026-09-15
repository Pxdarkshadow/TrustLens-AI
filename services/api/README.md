# TrustLens AI — API service

NestJS backend for the TrustLens anti-counterfeit product verification system.
Backs the `apps/admin-web` frontend on `http://localhost:3001/api`.

## Requirements

- Node.js v24+ (uses built-in `node:sqlite` — no Postgres, no Docker, no native builds)
- npm 11+

## Install & run

```bash
npm install
npx tsc -p tsconfig.json     # compile to dist/
node dist/main.js            # serve on :3001
```

First boot seeds the SQLite DB (`data/trustlens.db`) with demo accounts and
products. See `.env.example` for the (optional) environment variables; defaults
are baked into `src/config/config.ts`.

## Demo accounts (password == username)

| username   | role        |
|------------|-------------|
| `admin`    | admin       |
| `manu`     | manufacturer|
| `supp`     | supplier    |
| `retailer` | retailer    |

Seeded products: `c12345`, `c123`, `c32145` (Chanel bags), manufacturer
"Manu Group", location "Kuala Lumpur, Malaysia".

## API conventions

- Global prefix `api` → routes are `http://localhost:3001/api/...`
- Every success response: `{ success, data?, message?, timestamp }`
- Every error: `{ status, message, errors?, timestamp, path }`
- Auth: `Authorization: Bearer <accessToken>` (JWT, 15m). Refresh tokens are
  opaque, stored in `refresh_tokens`, valid 7 days, rotated on use.
- Role-guarded via `@Roles(...)`: `admin`, `manufacturer`, `supplier`,
  `retailer`. `verify` and image endpoints are public.

## Key endpoints

**Auth** `POST /auth/login`, `POST /auth/refresh`, `POST /auth/change-password`, `GET /auth/me`
**Users** (admin) `GET /users`, `GET /users/:id`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`, `PATCH /users/:id/role`
**Profiles** `GET /profiles/me`, `GET /profiles`, `GET /profiles/:username`, `POST /profiles`, `PATCH /profiles/me`, `POST /profiles/me/image`, `GET /profiles/image/:filename`
**Products** `GET /products`, `GET /products/:serialNumber`, `POST /products` (multipart), `PATCH /products/:serialNumber`, `POST /products/:serialNumber/history`, `GET /products/:serialNumber/history`, `POST /products/:serialNumber/verify` (public), `POST /products/:serialNumber/qr`, `GET /products/:serialNumber/qr/download`, `POST /products/:serialNumber/images`, `DELETE /products/:serialNumber/images/:imageId`, `POST /products/:serialNumber/revoke`, `POST /products/:serialNumber/activate`, `GET /products/image/:filename`

## Blockchain

`src/blockchain/blockchain.service.ts` stubs chain provenance ("local-*" hashes,
block 0). Fabric chaincode replaces this — see `infrastructure/hyperledger-fabric`.

## Smoke test

`bash smoke.sh` exercises the whole surface against a running server.