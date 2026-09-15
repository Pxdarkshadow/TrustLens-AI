import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { toUser } from '../auth/auth.service';
import { all, get, iso, run, uuid } from '../database/database';
import { paginate, PaginatedResponse, clampInt } from '../common/pagination';

export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const VALID_ROLES = ['admin', 'manufacturer', 'supplier', 'retailer'];

function rowToUser(r: UserRow): User {
  return toUser(r);
}

export { toUser };

@Injectable()
export class UsersService {
  findAll(pageRaw: unknown, limitRaw: unknown, searchRaw: unknown): PaginatedResponse<User> {
    const page = clampInt(pageRaw, 1, 1, 1_000_000);
    const limit = clampInt(limitRaw, 20, 1, 100);
    const search = String(searchRaw ?? '').trim();
    const where = search ? 'WHERE (username LIKE ? OR id LIKE ?)' : '';
    const like = `%${search}%`;
    const params = search ? [like, like] : [];
    const total = get<{ c: number }>(`SELECT COUNT(*) AS c FROM users ${where}`, params)?.c ?? 0;
    const offset = (page - 1) * limit;
    const rows = all<UserRow>(
      `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return paginate(rows.map(rowToUser), total, page, limit);
  }

  findOne(id: string): User {
    const u = get<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
    if (!u) throw new NotFoundException('User not found');
    return rowToUser(u);
  }

  findByUsername(username: string): User | null {
    const u = get<UserRow>('SELECT * FROM users WHERE username = ?', [username]);
    return u ? rowToUser(u) : null;
  }

  create(username: string, password: string, role: string): User {
    if (!username || !password) throw new BadRequestException('Username and password are required');
    if (password.length < 6) throw new BadRequestException('Password must be at least 6 characters');
    if (!VALID_ROLES.includes(role)) throw new BadRequestException(`Invalid role: ${role}`);
    if (this.findByUsername(username)) throw new ConflictException('Username already exists');
    const id = uuid();
    const t = iso();
    const hash = bcrypt.hashSync(password, 10);
    run('INSERT INTO users (id,username,password_hash,role,created_at,updated_at) VALUES (?,?,?,?,?,?)', [
      id, username, hash, role, t, t,
    ]);
    return this.findOne(id);
  }

  update(id: string, patch: { username?: string; password?: string; role?: string }): User {
    this.findOne(id); // 404 if missing
    if (patch.username !== undefined && patch.username !== this.findOne(id).username) {
      if (this.findByUsername(patch.username)) throw new ConflictException('Username already exists');
      run('UPDATE users SET username = ?, updated_at = ? WHERE id = ?', [patch.username, iso(), id]);
    }
    if (patch.password !== undefined) {
      if (patch.password.length < 6) throw new BadRequestException('Password must be at least 6 characters');
      run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [bcrypt.hashSync(patch.password, 10), iso(), id]);
    }
    if (patch.role !== undefined) {
      if (!VALID_ROLES.includes(patch.role)) throw new BadRequestException(`Invalid role: ${patch.role}`);
      run('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [patch.role, iso(), id]);
    }
    return this.findOne(id);
  }

  updateRole(id: string, role: string): User {
    if (!VALID_ROLES.includes(role)) throw new BadRequestException(`Invalid role: ${role}`);
    this.findOne(id);
    run('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [role, iso(), id]);
    return this.findOne(id);
  }

  remove(id: string): void {
    this.findOne(id);
    run('DELETE FROM refresh_tokens WHERE user_id = ?', [id]);
    run('DELETE FROM profiles WHERE user_id = ?', [id]);
    run('DELETE FROM users WHERE id = ?', [id]);
  }
}