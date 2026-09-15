import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { config } from '../config/config';
import { get, iso, run, uuid } from '../database/database';
import { User } from '../users/users.service';

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export function toUser(u: UserRow): User {
  return { id: u.id, username: u.username, role: u.role, createdAt: u.created_at, updatedAt: u.updated_at };
}

function signAccess(user: UserRow): string {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    // cast: env value is a plain string, jsonwebtoken accepts StringValue
    { expiresIn: config.jwtExpiresIn as unknown as number }
  );
}

@Injectable()
export class AuthService {
  login(username: string, password: string): { user: User; accessToken: string; refreshToken: string } {
    const user = get<UserRow>('SELECT * FROM users WHERE username = ?', [username]);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const refreshToken = this.createRefreshToken(user.id);
    return { user: toUser(user), accessToken: signAccess(user), refreshToken };
  }

  refresh(refreshToken: string): { accessToken: string; refreshToken: string } {
    const stored = get<{ id: string; user_id: string; expires_at: string }>(
      'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    );
    if (!stored) throw new UnauthorizedException('Invalid refresh token');
    if (new Date(stored.expires_at).getTime() < Date.now()) {
      run('DELETE FROM refresh_tokens WHERE id = ?', [stored.id]);
      throw new UnauthorizedException('Refresh token expired');
    }
    const user = get<UserRow>('SELECT * FROM users WHERE id = ?', [stored.user_id]);
    if (!user) throw new UnauthorizedException('User not found');
    // rotate: revoke old, issue new
    run('DELETE FROM refresh_tokens WHERE id = ?', [stored.id]);
    const newRefresh = this.createRefreshToken(user.id);
    return { accessToken: signAccess(user), refreshToken: newRefresh };
  }

  changePassword(username: string, currentPassword: string, newPassword: string): void {
    const user = get<UserRow>('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) throw new BadRequestException('User not found');
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }
    run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [
      bcrypt.hashSync(newPassword, 10),
      iso(),
      user.id,
    ]);
  }

  me(id: string): User {
    const user = get<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) throw new UnauthorizedException('User not found');
    return toUser(user);
  }

  private createRefreshToken(userId: string): string {
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + config.refreshExpiresDays * 24 * 60 * 60 * 1000).toISOString();
    run(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES (?,?,?,?,?)',
      [uuid(), userId, token, expiresAt, iso()]
    );
    return token;
  }
}