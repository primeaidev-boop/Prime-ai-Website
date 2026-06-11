# PRIM AI Institute

Lead generation website + admin dashboard for PRIM AI Institute, Ahmedabad.

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL to your Neon PostgreSQL URL
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

Server: http://localhost:3001  
Swagger: http://localhost:3001/api/docs

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App: http://localhost:5173

## Default Admin
- Email: admin@primaiinstitute.com
- Password: Admin@123

## Stack
- Frontend: React 19, TypeScript, Tailwind CSS v4, Vite 5
- Backend: NestJS 10, Prisma 5, PostgreSQL
- Auth: JWT (7-day tokens)
