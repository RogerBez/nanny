# Environment Setup Guide

This document explains the environment configuration for the NANNY monorepo.

## Overview

Each app in the monorepo has its own `.env` file for local development. These are created from `.env.example` templates and are **not tracked by Git** (added to `.gitignore`).

## Quick Start

### 1. Copy `.env.example` to `.env` for each app

```bash
# From repo root
cd apps/parent-app
cp .env.example .env

cd ../child-app
cp .env.example .env

cd ../vigilance-engine
cp .env.example .env

cd ../..
```

### 2. Update `.env` files with your values

Each app has specific environment variables documented in its `.env.example`. Update as needed for your setup.

## Apps & Variables

### Parent App (`apps/parent-app/.env`)

**Purpose**: React Native Expo app for parents

**Key Variables**:
- `EXPO_PUBLIC_API_URL`: Backend API endpoint (default: `http://localhost:3000`)
- `EXPO_PUBLIC_FIREBASE_*`: Firebase credentials for authentication & cloud messaging
- `EXPO_PUBLIC_DEBUG_MODE`: Enable/disable debug logging
- `EXPO_PUBLIC_MOCK_API`: Use mock responses instead of real API

**For local dev**: Use provided defaults. Replace Firebase credentials with your own project's values for production.

### Child App (`apps/child-app/.env`)

**Purpose**: React Native Expo app for children (messaging)

**Key Variables**:
- `EXPO_PUBLIC_API_URL`: Backend API endpoint
- `EXPO_PUBLIC_DEVICE_ID`: Unique device identifier for this child
- `EXPO_PUBLIC_CHILD_ID`: Child user ID
- `EXPO_PUBLIC_RSA_PUBLIC_KEY`: Public RSA key for message encryption
- `EXPO_PUBLIC_BACKGROUND_INTERVAL`: Background task refresh interval (ms)
- `EXPO_PUBLIC_MOCK_API`: Mock responses for development

**For local dev**: Use provided defaults. Generate real RSA keys for production.

### Vigilance Engine (`apps/vigilance-engine/.env`)

**Purpose**: Node.js/Express backend server

**Key Variables**:
- `PORT`: Server port (default: `3000`)
- `NODE_ENV`: Environment mode (`development`, `production`)
- `DATABASE_URL`: Database connection string (SQLite for local dev: `file:./dev.db`)
- `REDIS_URL`: Redis cache endpoint
- `API_KEY`: Secret key for client authentication
- `JWT_SECRET`: Secret for JWT token signing
- `RSA_PRIVATE_KEY` / `RSA_PUBLIC_KEY`: Encryption keypair
- `AES_SECRET_KEY`: AES-256 encryption key
- `LOG_LEVEL`: Logging verbosity
- `MOCK_DATABASE`: Use in-memory mock DB instead of Prisma/real DB

**For local dev**: SQLite + in-memory Redis mock. Generate real keys for production.

## Development vs. Production

### Development (Local)

- **`MOCK_API=true`** in frontend apps → responses from mock data
- **`MOCK_DATABASE=true`** in backend → in-memory store, no external DB required
- Firebase/encryption keys: Use demo values (provided in `.env`)
- No Redis needed locally (can use mock or skip)

### Production

- **`MOCK_API=false`** → real API calls
- **`MOCK_DATABASE=false`** → Prisma + PostgreSQL/SQLite
- **Real Firebase credentials** from your project
- **Real encryption keys** (generate securely, store in CI/CD secrets)
- **Real Redis instance** for caching
- **`NODE_ENV=production`** on backend
- **Sentry/monitoring enabled** for error tracking

## Security Notes

⚠️ **IMPORTANT**:

1. **Never commit `.env` files** to Git (added to `.gitignore`)
2. **Never share keys/secrets** in repos, emails, or chat
3. **Rotate keys regularly** in production
4. **Use CI/CD secrets** (GitHub Actions, deployment platforms) for production deploys
5. **Generate real RSA/AES keys** before production deployment

### Generating Encryption Keys (Production)

**RSA Keys**:
```bash
# Generate RSA private key (4096-bit)
openssl genrsa -out private.key 4096

# Extract public key
openssl rsa -in private.key -pubout -out public.key
```

**AES Secret Key** (32 bytes for AES-256):
```bash
# Generate random 32-byte hex string
openssl rand -hex 32
```

## Troubleshooting

### Port Already in Use

If port 3000 is in use, change `PORT` in `apps/vigilance-engine/.env` and update `EXPO_PUBLIC_API_URL` in parent/child apps accordingly.

### Firebase Issues

If you see Firebase auth errors:
1. Replace placeholder Firebase credentials with your project's values
2. Ensure Firebase Cloud Messaging is enabled
3. Check that your APK/bundle is registered in Firebase Console

### Database Connection Errors

For SQLite (local dev):
- Ensure write permissions in `apps/vigilance-engine/` directory
- Delete `dev.db` to reset database

For PostgreSQL (production):
- Verify connection string format: `postgresql://user:password@host:port/dbname`
- Test connection: `psql <DATABASE_URL>`

### API Connection Refused

If frontend can't reach backend:
1. Verify backend is running: `cd apps/vigilance-engine && npm run dev`
2. Check `EXPO_PUBLIC_API_URL` matches backend `HOST:PORT`
3. For Expo simulator: Use `http://host.docker.internal:3000` (Android) or `http://localhost:3000` (iOS simulator)

## Next Steps

1. **Copy .env files** from `.env.example`
2. **Install dependencies**: `npm install` in each app
3. **Start backend**: `cd apps/vigilance-engine && npm run dev`
4. **Start frontend**: `cd apps/parent-app && npm run dev` (in separate terminal)
5. **Begin Phase 1 development**

For questions or updates to this guide, see the main README.md or project documentation.
