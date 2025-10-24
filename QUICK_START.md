# Quick Start Guide

## First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your database URL and other settings

# 4. Setup database
npm run db:generate
npm run db:seed-all

# 5. Start development
npm run dev
```

## Daily Development

```bash
# Start development server
npm run dev

# Check code quality
npm run check

# Format code
npm run format:write

# View database
npm run db:studio
```

## Database Commands

```bash
# Seed all data
npm run db:seed-all

# Reset and reseed
npx prisma migrate reset
npm run db:seed-all

# View database
npm run db:studio
```

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3000/backend
- **Database**: `npm run db:studio`
