export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresDays: parseInt(process.env.REFRESH_EXPIRES_DAYS || '7', 10),
  databasePath: process.env.DATABASE_PATH || 'data/trustlens.db',
  storageDir: process.env.STORAGE_DIR || 'storage',
  // QR verification landing origin (frontend). Mobile uses trustlens:// scheme.
  appOrigin: 'http://localhost:5173',
} as const;

export function storagePath(...parts: string[]): string {
  return [config.storageDir, ...parts].join('/');
}