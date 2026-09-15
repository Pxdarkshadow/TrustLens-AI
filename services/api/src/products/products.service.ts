import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { storagePath } from '../config/config';
import { all, asBoolean, get, iso, run, uuid } from '../database/database';
import { paginate, PaginatedResponse, clampInt } from '../common/pagination';
import { BlockchainService } from '../blockchain/blockchain.service';

export interface ProductImage {
  id: string;
  productSerialNumber: string;
  filename: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface SupplyChainEvent {
  id: string;
  productSerialNumber: string;
  actor: string;
  role: string;
  location: string;
  timestamp: string;
  isSold: boolean;
  transactionHash?: string;
  blockNumber?: number;
  createdAt: string;
}

export interface Product {
  serialNumber: string;
  name: string;
  brand: string;
  description: string;
  manufacturerName: string;
  manufacturerLocation: string;
  manufactureDate: string;
  status: 'active' | 'inactive' | 'revoked' | 'sold';
  images: ProductImage[];
  primaryImage?: ProductImage;
  supplyChainHistory: SupplyChainEvent[];
  createdAt: string;
  updatedAt: string;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
}

interface ProductRow {
  serial_number: string;
  name: string;
  brand: string;
  description: string;
  manufacturer_name: string;
  manufacturer_location: string;
  manufacture_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  blockchain_tx_hash: string;
  blockchain_block_number: number;
}

interface ImageRow {
  id: string;
  product_serial_number: string;
  filename: string;
  is_primary: number;
  created_at: string;
}

interface EventRow {
  id: string;
  product_serial_number: string;
  actor: string;
  role: string;
  location: string;
  timestamp: string;
  is_sold: number;
  transaction_hash: string;
  block_number: number;
  created_at: string;
}

const PRODUCT_STATUSES = ['active', 'inactive', 'revoked', 'sold'];
const SORTABLE = ['createdAt', 'name', 'serialNumber', 'updatedAt'];

function toImage(r: ImageRow): ProductImage {
  return {
    id: r.id,
    productSerialNumber: r.product_serial_number,
    filename: r.filename,
    url: `/api/products/image/${encodeURIComponent(r.filename)}`,
    isPrimary: asBoolean(r.is_primary),
    createdAt: r.created_at,
  };
}

function toEvent(r: EventRow): SupplyChainEvent {
  return {
    id: r.id,
    productSerialNumber: r.product_serial_number,
    actor: r.actor,
    role: r.role,
    location: r.location,
    timestamp: r.timestamp,
    isSold: asBoolean(r.is_sold),
    transactionHash: r.transaction_hash || undefined,
    blockNumber: r.block_number,
    createdAt: r.created_at,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly blockchain: BlockchainService) {}

  findAll(opts: {
    page?: unknown;
    limit?: unknown;
    search?: unknown;
    status?: unknown;
    manufacturerId?: unknown;
    sortBy?: unknown;
    sortOrder?: unknown;
  }): PaginatedResponse<Product> {
    const page = clampInt(opts.page, 1, 1, 1_000_000);
    const limit = clampInt(opts.limit, 20, 1, 100);
    const search = String(opts.search ?? '').trim();
    const status = String(opts.status ?? '');
    const manufacturerId = String(opts.manufacturerId ?? '');
    const sortBy = String(opts.sortBy ?? 'createdAt');
    const sortOrder = String(opts.sortOrder ?? 'desc');

    const conds: string[] = [];
    const params: (string | number)[] = [];
    if (search) {
      conds.push('(name LIKE ? OR brand LIKE ? OR serial_number LIKE ? OR manufacturer_name LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    if (status && PRODUCT_STATUSES.includes(status)) {
      conds.push('status = ?');
      params.push(status);
    }
    if (manufacturerId) {
      // manufacturerName is WHO created it; map id->name is ambigious, so match by manufacturer_name when available
      const m = get<{ name: string }>('SELECT p.name FROM profiles p WHERE p.user_id = ?', [manufacturerId]);
      if (m) {
        conds.push('manufacturer_name = ?');
        params.push(m.name);
      }
    }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const total = get<{ c: number }>(`SELECT COUNT(*) AS c FROM products ${where}`, params)?.c ?? 0;
    const col = SORTABLE.includes(sortBy) ? sortBy : 'createdAt';
    const dir = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const orderCol = col === 'createdAt' ? 'created_at' : col === 'updatedAt' ? 'updated_at' : col;
    const offset = (page - 1) * limit;
    const sql = `SELECT * FROM products ${where} ORDER BY ${orderCol} ${dir} LIMIT ? OFFSET ?`;
    const rows = all<ProductRow>(sql, [...params, limit, offset]);
    return paginate(rows.map((r) => this.hydrate(r)), total, page, limit);
  }

  findBySerial(serialNumber: string): Product {
    const r = get<ProductRow>('SELECT * FROM products WHERE serial_number = ?', [serialNumber]);
    if (!r) throw new NotFoundException('Product not found');
    return this.hydrate(r);
  }

  create(input: {
    serialNumber: string;
    name: string;
    brand?: string;
    description?: string;
    manufacturerName?: string;
    manufacturerLocation?: string;
    manufactureDate?: string;
  }): Product {
    if (get<ProductRow>('SELECT * FROM products WHERE serial_number = ?', [input.serialNumber])) {
      throw new ConflictException('Product with this serial number already exists');
    }
    if (!input.serialNumber || !input.name) throw new BadRequestException('serialNumber and name are required');
    const t = iso();
    const tx = this.blockchain.registerProduct();
    run(
      'INSERT INTO products (serial_number,name,brand,description,manufacturer_name,manufacturer_location,manufacture_date,status,created_at,updated_at,blockchain_tx_hash,blockchain_block_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        input.serialNumber, input.name, input.brand ?? '', input.description ?? '',
        input.manufacturerName ?? '', input.manufacturerLocation ?? '', input.manufactureDate ?? '',
        'active', t, t, tx.transactionHash, tx.blockNumber,
      ]
    );
    // initial supply chain event
    const evTx = this.blockchain.addEvent();
    run(
      'INSERT INTO supply_chain_events (id,product_serial_number,actor,role,location,timestamp,is_sold,transaction_hash,block_number,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [uuid(), input.serialNumber, input.manufacturerName ?? '', 'manufacturer', input.manufacturerLocation ?? '', t, 0, evTx.transactionHash, evTx.blockNumber, t]
    );
    return this.findBySerial(input.serialNumber);
  }

  update(serialNumber: string, patch: { name?: string; brand?: string; description?: string }): Product {
    this.findBySerial(serialNumber);
    const t = iso();
    const existing = get<ProductRow>('SELECT * FROM products WHERE serial_number = ?', [serialNumber]) as ProductRow;
    run(
      'UPDATE products SET name = ?, brand = ?, description = ?, updated_at = ? WHERE serial_number = ?',
      [patch.name ?? existing.name, patch.brand ?? existing.brand, patch.description ?? existing.description, t, serialNumber]
    );
    return this.findBySerial(serialNumber);
  }

  addHistory(
    serialNumber: string,
    input: { actor: string; role: string; location: string; timestamp: string; isSold: boolean }
  ): Product {
    this.findBySerial(serialNumber);
    if (!['supplier', 'retailer'].includes(input.role)) throw new BadRequestException('role must be supplier or retailer');
    const tx = this.blockchain.addEvent();
    run(
      'INSERT INTO supply_chain_events (id,product_serial_number,actor,role,location,timestamp,is_sold,transaction_hash,block_number,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [
        uuid(), serialNumber, input.actor ?? '', input.role, input.location ?? '',
        input.timestamp || iso(), input.isSold ? 1 : 0, tx.transactionHash, tx.blockNumber, iso(),
      ]
    );
    if (input.isSold) {
      this.setStatus(serialNumber, 'sold');
    }
    return this.findBySerial(serialNumber);
  }

  history(serialNumber: string): SupplyChainEvent[] {
    this.findBySerial(serialNumber);
    return all<EventRow>('SELECT * FROM supply_chain_events WHERE product_serial_number = ? ORDER BY timestamp ASC, created_at ASC', [serialNumber]).map(toEvent);
  }

  verify(serialNumber: string): { isAuthentic: boolean; product?: Product; message: string; verificationId: string; verifiedAt: string } {
    const r = get<ProductRow>('SELECT * FROM products WHERE serial_number = ?', [serialNumber]);
    const authentic = !!r && r.status !== 'revoked';
    return {
      isAuthentic: authentic,
      product: r ? this.hydrate(r) : undefined,
      message: !r ? 'No such product found' : authentic ? 'Product is authentic' : 'Product has been revoked',
      verificationId: uuid(),
      verifiedAt: iso(),
    };
  }

  async generateQR(serialNumber: string, appOrigin: string): Promise<{ qrCodeData: object; qrCodeImageUrl: string }> {
    this.findBySerial(serialNumber);
    const t = iso();
    const qrDir = storagePath('qr');
    mkdirSync(qrDir, { recursive: true });
    const file = join(process.cwd(), qrDir, `${serialNumber}.png`);
    const payload = `trustlens://verify/${serialNumber}?t=${t}`;
    await QRCode.toFile(file, payload, { width: 512, margin: 1 });
    return {
      qrCodeData: {
        productId: serialNumber,
        verificationUrl: `${appOrigin}/verify/${serialNumber}`,
        timestamp: t,
      },
      qrCodeImageUrl: `/api/products/${serialNumber}/qr/download`,
    };
  }

  qrImagePath(serialNumber: string): string {
    const p = join(process.cwd(), storagePath('qr'), `${serialNumber}.png`);
    if (!existsSync(p)) throw new NotFoundException('QR image not generated yet');
    return p;
  }

  addImage(serialNumber: string, filename: string): ProductImage {
    this.findBySerial(serialNumber);
    const hasPrimary = get<{ c: number }>('SELECT COUNT(*) AS c FROM product_images WHERE product_serial_number = ? AND is_primary = 1', [serialNumber])?.c;
    const isPrimary = (hasPrimary ?? 0) === 0 ? 1 : 0;
    const id = uuid();
    run('INSERT INTO product_images (id,product_serial_number,filename,is_primary,created_at) VALUES (?,?,?,?,?)', [
      id, serialNumber, filename, isPrimary, iso(),
    ]);
    const row = get<ImageRow>('SELECT * FROM product_images WHERE id = ?', [id]) as ImageRow;
    return toImage(row);
  }

  removeImage(serialNumber: string, imageId: string): void {
    this.findBySerial(serialNumber);
    const img = get<ImageRow>('SELECT * FROM product_images WHERE id = ? AND product_serial_number = ?', [imageId, serialNumber]);
    if (img) {
      run('DELETE FROM product_images WHERE id = ?', [imageId]);
      // promote a remaining image if we deleted the primary
      const remaining = get<{ c: number }>('SELECT COUNT(*) AS c FROM product_images WHERE product_serial_number = ? AND is_primary = 1', [serialNumber])?.c;
      if ((remaining ?? 0) === 0) {
        const next = get<ImageRow>('SELECT * FROM product_images WHERE product_serial_number = ? LIMIT 1', [serialNumber]);
        if (next) run('UPDATE product_images SET is_primary = 1 WHERE id = ?', [next.id]);
      }
    }
  }

  setStatus(serialNumber: string, status: string): Product {
    if (!PRODUCT_STATUSES.includes(status)) throw new BadRequestException(`Invalid status: ${status}`);
    this.findBySerial(serialNumber);
    run('UPDATE products SET status = ?, updated_at = ? WHERE serial_number = ?', [status, iso(), serialNumber]);
    return this.findBySerial(serialNumber);
  }

  // GET /products/image/:filename — filename is globally unique (timestamp-hex), no serial lookup needed
  getImageByFilename(filename: string): string {
    const p = join(process.cwd(), storagePath('images', 'products', safeName(filename)));
    if (!existsSync(p)) throw new NotFoundException('Image not found');
    return p;
  }

  private hydrate(r: ProductRow): Product {
    const images = all<ImageRow>('SELECT * FROM product_images WHERE product_serial_number = ? ORDER BY is_primary DESC, created_at ASC', [r.serial_number]).map(toImage);
    const history = all<EventRow>('SELECT * FROM supply_chain_events WHERE product_serial_number = ? ORDER BY timestamp ASC, created_at ASC', [r.serial_number]).map(toEvent);
    const primary = images.find((i) => i.isPrimary);
    const product: Product = {
      serialNumber: r.serial_number,
      name: r.name,
      brand: r.brand,
      description: r.description,
      manufacturerName: r.manufacturer_name,
      manufacturerLocation: r.manufacturer_location,
      manufactureDate: r.manufacture_date,
      status: r.status as Product['status'],
      images,
      supplyChainHistory: history,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    if (primary) product.primaryImage = primary;
    if (r.blockchain_tx_hash) product.blockchainTxHash = r.blockchain_tx_hash;
    if (r.blockchain_block_number) product.blockchainBlockNumber = r.blockchain_block_number;
    return product;
  }
}

function safeName(filename: string): string {
  return filename.replace(/[^A-Za-z0-9._-]/g, '');
}
export { safeName };