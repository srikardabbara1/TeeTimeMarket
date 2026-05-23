# TeeTimeMarket

A marketplace for buying and selling golf tee times. Users can create accounts, add their location and golfer count preferences in their profile, browse tee times near them, and list tee times for sale.


## Features

- **Authentication**: Sign up and sign in
- **Profile**: Add location (city/state) and golfer count filter
- **Marketplace**: Browse tee times with filters for golfers needed, city, and state
- **Sell tee times**: List tee times with course details, time, cost, and slots
- **Contact seller**: Email sellers directly from the marketplace

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js
- Vercel (deployment)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

- **DATABASE_URL**: PostgreSQL connection string. Options:
  - **Local**: Run `npx prisma dev` in one terminal to start local Postgres, then run migrations
  - **Neon** (free): Sign up at [neon.tech](https://neon.tech) and paste the connection string
  - **Supabase** (free): Create a project and use the connection string
- **AUTH_SECRET**: Generate with `openssl rand -base64 32`

### 3. Database migrations and Prisma client

```bash
npx prisma migrate dev
npx prisma generate
```

After changing the schema or running migrations, run `npx prisma generate` and restart the dev server (`npm run dev`) so the app uses the updated client.

### 4. Seed demo data (optional, dev only)

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates sample tee times. Login: `seller@example.com` / `password123`

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` – Your PostgreSQL connection string (Neon, Supabase, or Vercel Postgres)
   - `AUTH_SECRET` – Generate with `openssl rand -base64 32`
   - `AUTH_URL` – Your production URL (e.g. `https://teetimemarket.vercel.app`)
4. Deploy
