# NANNY - Parental Monitoring System

A comprehensive, TypeScript-based parental monitoring system with end-to-end encrypted message analysis and account freezing capabilities.

## 🏗️ Project Structure

```
apps/
├── vigilance-engine/    # Express.js backend API server
├── parent-app/          # Parent React Native app (iOS/Android)
├── child-app/           # Child React Native app (iOS/Android)
└── shared/              # Shared TypeScript types and utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- TypeScript 5.2+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/RogerBez/nanny.git
cd nanny

# Install all dependencies (from root)
npm install

# Or install per app:
cd apps/vigilance-engine && npm install
cd apps/parent-app && npm install
cd apps/child-app && npm install
```

### Development Setup (3-Terminal Workflow)

**Terminal 1 - Backend (Vigilance Engine)**
```bash
cd apps/vigilance-engine
npm run dev:watch
# Listens on http://localhost:8080
# Watch mode rebuilds on file changes
```

**Terminal 2 - Parent App**
```bash
cd apps/parent-app
npm run dev
# Runs parent monitoring dashboard
```

**Terminal 3 - Child App**
```bash
cd apps/child-app
npm run dev
# Runs child messaging app
```

### Environment Variables

Create `.env` files for each app:

**apps/vigilance-engine/.env**
```
PORT=8080
NODE_ENV=development
LOG_LEVEL=debug
```

**apps/parent-app/.env.local**
```
EXPO_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
```

**apps/child-app/.env.local**
```
EXPO_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
```

## 📚 Available Scripts

### Vigilance Engine (Backend)
```bash
npm run dev           # Build and run server
npm run dev:watch    # Watch mode with rebuild
npm run dev:ts       # Run with ts-node (no build)
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled server
npm test             # Run Jest tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Parent App
```bash
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Lint code
```

### Child App
```bash
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Lint code
```

## 🔌 API Endpoints

### POST /ingest
Receive encrypted messages from child app.

**Request:**
```json
{
  "childId": "string",
  "encryptedPayload": "base64-string",
  "deviceId": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success" | "error",
  "messageId": "string",
  "error": "string (if status=error)"
}
```

### POST /score
Analyze and score a message for threat level.

**Request:**
```json
{
  "childId": "string",
  "encryptedPayload": "base64-string"
}
```

**Response:**
```json
{
  "status": "success" | "error",
  "score": 0-100,
  "riskLevel": "low" | "medium" | "high" | "critical",
  "flagged": boolean,
  "explanation": "string",
  "flags": ["keyword1", "keyword2"],
  "messageId": "string"
}
```

### POST /freeze
Freeze a child's account.

**Request:**
```json
{
  "childId": "string",
  "reason": "string (optional)",
  "parentId": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success" | "error",
  "frozen": true,
  "childId": "string",
  "timestamp": number
}
```

### GET /freeze/:childId
Check freeze status for a child.

**Response:**
```json
{
  "status": "success",
  "frozen": boolean,
  "childId": "string",
  "reason": "string (if frozen)"
}
```

### POST /unfreeze
Unfreeze a child's account.

**Request:**
```json
{
  "childId": "string",
  "parentId": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success" | "error",
  "frozen": false,
  "childId": "string"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "ISO-8601",
  "environment": "development" | "production"
}
```

## 🔐 Security Features

- **End-to-End Encryption:** Messages encrypted with AES-256-GCM + RSA-OAEP
- **Audit Logging:** All actions logged to `logs/audit.log`
- **Input Validation:** Request payloads validated on every endpoint
- **CORS Protection:** Configurable Cross-Origin Resource Sharing
- **Environment Isolation:** Sensitive data stored in `.env` files

## 🧪 Testing

### Run All Tests
```bash
cd apps/vigilance-engine && npm test
cd apps/parent-app && npm test
cd apps/child-app && npm test
```

### Run Specific Test File
```bash
cd apps/vigilance-engine
npm test -- ingest.test.ts
npm test -- score.test.ts
npm test -- freeze.test.ts
```

### Watch Mode (Tests rerun on file changes)
```bash
cd apps/vigilance-engine
npm test -- --watch
```

### Coverage Report
```bash
cd apps/vigilance-engine
npm test -- --coverage
```

## 🛠️ Linting & Formatting

### Lint All
```bash
cd apps/vigilance-engine && npm run lint
cd apps/parent-app && npm run lint
cd apps/child-app && npm run lint
```

### Format All
```bash
cd apps/vigilance-engine && npm run format
cd apps/parent-app && npm run format
cd apps/child-app && npm run format
```

## 📋 Shared Types

All API request/response types are defined in `apps/shared/types/index.ts` and available for import:

```typescript
import {
  IngestPayload,
  ScorePayload,
  FreezePayload,
  IngestResponse,
  ScoreResponse,
  FreezeResponse,
} from '@nanny/types';
```

## 📊 Architecture

### Backend - Vigilance Engine
- Express.js server with TypeScript
- Three core routes: `/ingest`, `/score`, `/freeze`
- In-memory stores for messages and freeze state (MVP)
- Audit logging to filesystem
- Threat scoring using keyword detection

### Frontend - Parent App
- React Native + Expo
- Dashboard showing monitored children
- Freeze/unfreeze controls
- Message analysis and risk level display
- JWT authentication (MVP)

### Frontend - Child App
- React Native + Expo
- Message sending interface
- Encryption/decryption utilities
- Account status monitoring
- Login/logout flows

## 🔄 End-to-End Flow

1. **Child sends message:**
   - Child app encrypts message locally using AES-256-GCM
   - Sends encrypted payload to `/ingest` endpoint

2. **Backend receives & processes:**
   - `/ingest` decrypts and stores message
   - System automatically calls `/score` endpoint
   - Threat level calculated based on keywords and patterns

3. **Parent reviews flagged messages:**
   - Parent app fetches scored messages via `/score`
   - Displays flagged messages with risk level and explanation
   - Parent can decide to freeze account

4. **Parent freezes if needed:**
   - Parent app calls `/freeze` endpoint
   - Backend stores freeze state in-memory
   - Child app checks `/freeze/:childId` and blocks messaging

## 📝 Logging

### Audit Logs
Location: `apps/vigilance-engine/logs/audit.log`

Format:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "action": "ingest|score|freeze|unfreeze",
  "childId": "child-1",
  "messageId": "msg-123",
  "ipAddress": "192.168.1.1",
  "userAgent": "..."
}
```

### Scoring Logs
Location: `apps/vigilance-engine/logs/scoring.log`

Records all message scoring with threat details.

## 🚀 Deployment

### Build All Packages
```bash
# Backend
cd apps/vigilance-engine && npm run build

# Frontend (React Native builds via Expo)
# Managed through EAS Build (expo.dev)
```

### Docker Support (Optional)
Coming soon - Dockerfile for containerized backend.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080
# Kill process
kill -9 <PID>
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

### Test Failures
```bash
# Rebuild types
npm run build
# Clear Jest cache
npm test -- --clearCache
```

## 📦 Dependencies

### Core
- `express` - Web server
- `typescript` - Type safety
- `react-native` / `expo` - Mobile framework
- `dotenv` - Environment config

### Testing
- `jest` - Test runner
- `supertest` - HTTP assertions
- `ts-jest` - TypeScript + Jest

### Development
- `ts-node` - TypeScript execution
- `nodemon` - Auto-restart
- `eslint` - Code linting
- `prettier` - Code formatting

## 📄 License

MIT License - See LICENSE file for details.

## 👥 Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Submit pull request

## 📞 Support

For issues and questions, please open a GitHub issue or contact the development team.

---

**Last Updated:** November 13, 2024
**Version:** 0.1.0 (MVP)
