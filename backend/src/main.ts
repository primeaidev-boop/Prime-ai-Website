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
import { randomBytes } from 'crypto';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Increase body limit to 10 MB for large tutorial JSON saves
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require('express') as typeof import('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const isHttps = process.env.HTTPS_ENABLED === 'true';

  // ── Security headers ──────────────────────────────────────────────────────
  // Per-request nonce for inline <script> tags (GTM bootstrap snippet, JSON-LD
  // blocks injected by the SEO renderer). Must run before helmet() so the CSP
  // directive functions below can read it off res.locals.
  app.use((_req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    res.locals.cspNonce = randomBytes(16).toString('base64');
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // 'unsafe-eval' is required by Monaco Editor's AMD loader (vs/loader.js uses eval()).
          // Monaco is only loaded in the admin panel (JWT-protected), so risk is contained.
          // GTM/GA4/Meta Pixel scripts are allow-listed by origin; the inline GTM
          // bootstrap snippet in frontend/index.html is allowed via per-request nonce
          // instead of 'unsafe-inline' (see res.locals.cspNonce above).
          scriptSrc: [
            "'self'",
            "'unsafe-eval'",
            'https://cdn.jsdelivr.net',
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://connect.facebook.net',
            (_req, res) => `'nonce-${(res as unknown as { locals: { cspNonce: string } }).locals.cspNonce}'`,
          ],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com',
            'https://www.facebook.com',
          ],
          connectSrc: [
            "'self'",
            'https://cdn.jsdelivr.net',
            'https://www.google-analytics.com',
            'https://analytics.google.com',
            'https://region1.google-analytics.com',
            'https://region1.analytics.google.com',
            'https://www.googletagmanager.com',
            'https://stats.g.doubleclick.net',
            'https://www.facebook.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
          objectSrc: ["'none'"],
          frameSrc: [
            "'self'",
            'https://www.google.com',
            'https://www.youtube.com',
            'https://www.youtube-nocookie.com',
            'https://player.vimeo.com',
            'https://www.googletagmanager.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
          // Monaco creates Web Workers via blob: URLs; CDN workers also need jsdelivr.net
          workerSrc: ["'self'", 'blob:', 'https://cdn.jsdelivr.net'],
          // Only upgrade to HTTPS once SSL cert is active - on HTTP this breaks API calls
          upgradeInsecureRequests: isHttps ? [] : null,
        },
      },
      // Only send HSTS once SSL is active - on plain HTTP this forces HTTPS and breaks login
      hsts: isHttps
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  // ── Cookie parser (required for httpOnly JWT) ─────────────────────────────
  app.use(cookieParser());

  // ── CORS - exact-match origins only ──────────────────────────────────────
  // ADDITIONAL_ORIGINS: comma-separated list for non-domain access (e.g. bare server IP)
  const extraOrigins = (process.env.ADDITIONAL_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
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
