# Silver Line

Jewelry e-commerce platform built with Next.js 15, Prisma, and Neon PostgreSQL.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Environment

Required variables: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. See `.env.example` for full list.

## Vercel Deployment

1. Import this repo at [vercel.com](https://vercel.com) → New Project
2. Add environment variables (Settings → Environment Variables):
   - `DATABASE_URL`, `DIRECT_URL` (Neon)
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (use your Vercel URL, e.g. `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_API_URL` (same as NEXTAUTH_URL)
   - `JWT_SECRET` (admin panel)
   - Razorpay, Delhivery, Email vars as needed
3. Deploy — Vercel auto-builds on push to main
