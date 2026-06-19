// NestJS application entry point

// Load .env before anything else so process.env is populated for CORS/Helmet setup
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser') as () => ReturnType<typeof import('cookie-parser')>;
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isHttps = process.env.HTTPS_ENABLED === 'true';

  // ── Security headers ──────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          objectSrc: ["'none'"],
          frameSrc: ["'self'", 'https://www.google.com'],
          // Only upgrade to HTTPS once SSL cert is active — on HTTP this breaks API calls
          upgradeInsecureRequests: isHttps ? [] : null,
        },
      },
      // Only send HSTS once SSL is active — on plain HTTP this forces HTTPS and breaks login
      hsts: isHttps
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ── Cookie parser (required for httpOnly JWT) ─────────────────────────────
  app.use(cookieParser());

  // ── CORS — exact-match origins only ──────────────────────────────────────
  // ADDITIONAL_ORIGINS: comma-separated list for non-domain access (e.g. bare server IP)
  const extraOrigins = (process.env.ADDITIONAL_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    ...extraOrigins,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PRIM AI Institute API')
      .setDescription('Lead generation and admin dashboard API')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('admin_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger docs at http://localhost:${port}/api/docs`);
  }
}

bootstrap();
