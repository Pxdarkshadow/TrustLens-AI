import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { config } from '../config/config';
import * as bcrypt from 'bcryptjs';

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  mkdirSync(dirname(config.databasePath), { recursive: true });
  db = new DatabaseSync(config.databasePath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  initSchema(db);
  seed(db);
  return db;
}

function initSchema(d: DatabaseSync): void {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','manufacturer','supplier','retailer')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      username TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      image_filename TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      serial_number TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      manufacturer_name TEXT NOT NULL DEFAULT '',
      manufacturer_location TEXT NOT NULL DEFAULT '',
      manufacture_date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','revoked','sold')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      blockchain_tx_hash TEXT NOT NULL DEFAULT '',
      blockchain_block_number INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_serial_number TEXT NOT NULL REFERENCES products(serial_number),
      filename TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS supply_chain_events (
      id TEXT PRIMARY KEY,
      product_serial_number TEXT NOT NULL REFERENCES products(serial_number),
      actor TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      timestamp TEXT NOT NULL,
      is_sold INTEGER NOT NULL DEFAULT 0,
      transaction_hash TEXT NOT NULL DEFAULT '',
      block_number INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

// --- query helpers (parameterized everywhere) ---

type Row = Record<string, unknown>;
type SqlParams = (string | number | null | bigint | Uint8Array)[];

export function run(sql: string, params: SqlParams = []): void {
  getDb().prepare(sql).run(...params);
}

export function get<T = Row>(sql: string, params: SqlParams = []): T | null {
  const row = getDb().prepare(sql).get(...params) as T | undefined;
  return row ?? null;
}

export function all<T = Row>(sql: string, params: SqlParams = []): T[] {
  return getDb().prepare(sql).all(...params) as T[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function uid(): string {
  return crypto.randomUUID();
}

const SAMPLE_PROFILES: { username: string; name: string; location: string; desc: string }[] = [
  { username: 'admin', name: 'Admin', location: 'Global', desc: 'Platform administrator' },
  { username: 'manu', name: 'Manu Group', location: 'Kuala Lumpur, Malaysia', desc: 'Luxury manufacturer' },
  { username: 'supp', name: 'CK Supplier', location: 'Singapore', desc: 'Certified supplier' },
  { username: 'retailer', name: 'RE retailer', location: 'Dubai, UAE', desc: 'Authorized retailer' },
];

const SAMPLE_PRODUCTS: { serial: string; name: string; brand: string; desc: string }[] = [
  { serial: 'c12345', name: 'Chanel Classic Handbag', brand: 'Chanel', desc: 'Classic flap handbag in caviar leather' },
  { serial: 'c123', name: 'Chanel Flap Bag', brand: 'Chanel', desc: 'Signature Chanel flap bag' },
  { serial: 'c32145', name: 'Chanel Mini Flap Bag', brand: 'Chanel', desc: 'Mini size flap bag' },
];

export function seed(d: DatabaseSync): void {
  const { users } = count();
  if (users > 0) return;

  const seeds: { username: string; role: string }[] = [
    { username: 'admin', role: 'admin' },
    { username: 'manu', role: 'manufacturer' },
    { username: 'supp', role: 'supplier' },
    { username: 'retailer', role: 'retailer' },
  ];
  const t = nowIso();
  for (const s of seeds) {
    const id = uid();
    const hash = bcrypt.hashSync(s.username, 10); // password == username
    d.prepare('INSERT INTO users (id,username,password_hash,role,created_at,updated_at) VALUES (?,?,?,?,?,?)').run(id, s.username, hash, s.role, t, t);
    const p = SAMPLE_PROFILES.find((x) => x.username === s.username)!;
    d.prepare(
      'INSERT INTO profiles (id,user_id,username,name,description,website,location,image_filename,role,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    ).run(uid(), id, s.username, p.name, p.desc, '', p.location, '', s.role, t, t);
  }
  const manuId = get<{ id: string }>('SELECT id FROM users WHERE username = ?', ['manu'])!.id;
  const manuName = 'Manu Group';
  const manuLoc = 'Kuala Lumpur, Malaysia';
  for (const p of SAMPLE_PRODUCTS) {
    d.prepare(
      'INSERT INTO products (serial_number,name,brand,description,manufacturer_name,manufacturer_location,manufacture_date,status,created_at,updated_at,blockchain_tx_hash,blockchain_block_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    ).run(
      p.serial, p.name, p.brand, p.desc, manuName, manuLoc,
      '2024-01-15', 'active', t, t,
      'local-' + crypto.randomUUID().slice(0, 8), 0
    );
    d.prepare(
      'INSERT INTO supply_chain_events (id,product_serial_number,actor,role,location,timestamp,is_sold,transaction_hash,block_number,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).run(uid(), p.serial, manuName, 'manufacturer', manuLoc, t, 0, 'local-' + crypto.randomUUID().slice(0, 8), 0, t);
  }
}

export function count(): { users: number; products: number } {
  const u = get<{ c: number }>('SELECT COUNT(*) AS c FROM users');
  const p = get<{ c: number }>('SELECT COUNT(*) AS c FROM products');
  return { users: u?.c ?? 0, products: p?.c ?? 0 };
}

// tiny JSON helpers to normalise row shapes for responses
export function iso(): string {
  return nowIso();
}
export function uuid(): string {
  return uid();
}
export function asBoolean(v: unknown): boolean {
  return v === 1 || v === true;
}