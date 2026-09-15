import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { storagePath } from '../config/config';
import { all, get, iso, run, uuid } from '../database/database';

export interface Profile {
  id: string;
  userId: string;
  username: string;
  name: string;
  description: string;
  website: string;
  location: string;
  imageUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileRow {
  id: string;
  user_id: string;
  username: string;
  name: string;
  description: string;
  website: string;
  location: string;
  image_filename: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const PROFILE_IMG_DIR = () => storagePath('images', 'profiles');
export { PROFILE_IMG_DIR };

function rowToProfile(r: ProfileRow): Profile {
  const p: Profile = {
    id: r.id,
    userId: r.user_id,
    username: r.username,
    name: r.name,
    description: r.description,
    website: r.website,
    location: r.location,
    role: r.role,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
  if (r.image_filename) p.imageUrl = `/api/profiles/image/${encodeURIComponent(r.image_filename)}`;
  return p;
}

@Injectable()
export class ProfilesService {
  findByUsername(username: string): Profile {
    const r = get<ProfileRow>('SELECT * FROM profiles WHERE username = ?', [username]);
    if (!r) throw new NotFoundException('Profile not found');
    return rowToProfile(r);
  }

  findByUserId(userId: string): Profile {
    const r = get<ProfileRow>('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    if (!r) throw new NotFoundException('Profile not found');
    return rowToProfile(r);
  }

  findAll(): Profile[] {
    return all<ProfileRow>('SELECT * FROM profiles ORDER BY created_at ASC').map(rowToProfile);
  }

  create(input: { username: string; name?: string; description?: string; website?: string; location?: string; role: string }): Profile {
    if (get<ProfileRow>('SELECT * FROM profiles WHERE username = ?', [input.username])) {
      throw new ConflictException('Profile already exists for username');
    }
    // profile must map to a real user
    const user = get<{ id: string; role: string }>('SELECT id, role FROM users WHERE username = ?', [input.username]);
    if (!user) throw new BadRequestException(`No user with username '${input.username}'`);
    const t = iso();
    run(
      'INSERT INTO profiles (id,user_id,username,name,description,website,location,image_filename,role,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [
        uuid(), user.id, input.username, input.name ?? '', input.description ?? '', input.website ?? '',
        input.location ?? '', '', input.role || user.role, t, t,
      ]
    );
    return this.findByUsername(input.username);
  }

  updateMe(userId: string, patch: { name?: string; description?: string; website?: string; location?: string }): Profile {
    const existing = this.findByUserId(userId);
    run(
      'UPDATE profiles SET name = ?, description = ?, website = ?, location = ?, updated_at = ? WHERE user_id = ?',
      [
        patch.name ?? existing.name,
        patch.description ?? existing.description,
        patch.website ?? existing.website,
        patch.location ?? existing.location,
        iso(), userId,
      ]
    );
    return this.findByUserId(userId);
  }

  setImage(userId: string, filename: string): Profile {
    const existing = get<ProfileRow>('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    if (!existing) throw new NotFoundException('Profile not found');
    this.removeImageFile(existing.image_filename);
    run('UPDATE profiles SET image_filename = ?, updated_at = ? WHERE user_id = ?', [filename, iso(), userId]);
    return this.findByUserId(userId);
  }

  imagePath(filename: string): string {
    const safe = filename.replace(/[^A-Za-z0-9._-]/g, '');
    const p = join(PROFILE_IMG_DIR(), safe);
    if (!existsSync(p)) throw new NotFoundException('Image not found');
    return p;
  }

  ensureImageDir(): string {
    const d = PROFILE_IMG_DIR();
    mkdirSync(d, { recursive: true });
    return d;
  }

  private removeImageFile(filename: string): void {
    if (!filename) return;
    const p = join(PROFILE_IMG_DIR(), filename.replace(/[^A-Za-z0-9._-]/g, ''));
    try {
      if (existsSync(p)) rmSync(p);
    } catch {
      /* ignore */
    }
  }
}