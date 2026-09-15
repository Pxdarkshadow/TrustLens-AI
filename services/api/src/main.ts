import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config/config';
import { getDb } from './database/database';

async function bootstrap(): Promise<void> {
  getDb(); // init schema + seed on boot
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], credentials: true });
  await app.listen(config.port);
  // eslint-disable-next-line no-console
  console.log(`TrustLens API listening on http://localhost:${config.port}/api`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start API:', err);
  process.exit(1);
});