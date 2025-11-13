# Phase 1 Scaffolding Checklist

This checklist tracks readiness for Phase 1 core development. All items below should be completed before VS Code AI begins scaffolding Phase 1 components.

## ✅ Phase 0 Complete

- [x] Git repository initialized and synced with GitHub
- [x] Monorepo structure created (apps/, docs/, infra/, tests/)
- [x] package.json scaffolded for all three apps
- [x] npm dependencies installed locally
- [x] All npm scripts verified (dev, build, test, lint, format)
- [x] .gitignore configured (root + per-app)
- [x] node_modules and package-lock.json removed from Git tracking
- [x] Environment templates created (.env.example for each app)
- [x] Local .env files created with development values
- [x] Comprehensive README.md written
- [x] ENV_SETUP.md documentation created

## 🚀 Phase 1 Scaffolding Readiness

### Backend (Vigilance Engine)

**To implement**:

- [ ] **Express server setup** (`src/index.ts`)
  - Initialize Express app
  - Configure middleware (CORS, JSON parsing, auth)
  - Error handling middleware
  - Logging setup (Winston or Pino)

- [ ] **Routes** (`src/routes/`)
  - [ ] `POST /ingest` – Accept encrypted messages
    - Decrypt using RSA private key + AES
    - Store in DB / in-memory cache
    - Return receipt ID
  
  - [ ] `POST /score` – Analyze and score messages
    - Load slang/threat database
    - Calculate threat score (0-100)
    - Return risk level + metadata
  
  - [ ] `POST /freeze` – Account freeze action
    - Verify parent auth
    - Mark child account as frozen
    - Trigger notifications
    - Log audit trail

- [ ] **Utilities** (`src/utils/`)
  - [ ] `decrypt.ts` – RSA (private key) → AES key unwrap, then AES-256-GCM decryption
  - [ ] `slangScorer.ts` – Threat detection algorithm (regex, ML model, or curated dictionary)
  - [ ] `auditLogger.ts` – Log all sensitive actions (freeze, high-risk messages)
  - [ ] `validators.ts` – Input validation (message format, size limits, auth checks)

- [ ] **Database** (`src/db/`)
  - [ ] Prisma schema (`prisma/schema.prisma`)
    - Child model (ID, parent_id, frozen)
    - Message model (ID, child_id, content, score, timestamp)
    - AuditLog model (action, actor, timestamp)
  
  - [ ] Mock DB (`mock.ts`) – In-memory storage for development
  - [ ] Migrations – Initialize SQLite / PostgreSQL

- [ ] **Middleware** (`src/middleware/`)
  - [ ] JWT auth verification
  - [ ] Rate limiting
  - [ ] Request logging

- [ ] **Tests** (`src/__tests__/`)
  - [ ] Unit tests for encrypt/decrypt
  - [ ] Unit tests for slang scorer
  - [ ] Integration tests for /ingest, /score, /freeze endpoints
  - [ ] Mock data fixtures

---

### Parent App

**To implement**:

- [ ] **Navigation** (`src/navigation/`)
  - [ ] Root navigator stack
  - [ ] Tab navigator (if needed)
  - [ ] Screen transitions

- [ ] **Screens** (`src/screens/`)
  - [ ] LoginScreen
    - Email/password input
    - Firebase Auth integration
    - Error handling
  
  - [ ] DashboardScreen
    - List of monitored children
    - Quick status (online/offline)
    - Message alert summary
  
  - [ ] ChildListScreen
    - Full child details
    - Activity timeline
    - Threat history
  
  - [ ] FreezeScreen
    - Confirmation modal
    - Freeze account action
    - Success/error feedback

- [ ] **Components** (`src/components/`)
  - [ ] ChildCard (for dashboard)
  - [ ] MessageAlert (for warnings)
  - [ ] FreezeConfirm (modal)
  - [ ] LoadingSpinner, ErrorBoundary

- [ ] **API Client** (`src/api/`)
  - [ ] HTTP client setup (axios with base URL)
  - [ ] Mock API responses for development
  - [ ] Error handling & retry logic

- [ ] **State Management** (`src/state/`)
  - [ ] Redux setup or Context API
  - [ ] User auth state
  - [ ] Children list state
  - [ ] Message alerts state

- [ ] **Tests** (`src/__tests__/`)
  - [ ] Component snapshot tests
  - [ ] Screen navigation tests
  - [ ] API mock integration tests

---

### Child App

**To implement**:

- [ ] **Navigation** (`src/navigation/`)
  - [ ] Root navigator stack
  - [ ] Screen transitions

- [ ] **Screens** (`src/screens/`)
  - [ ] LoginScreen
    - Email/password input
    - Firebase Auth integration
  
  - [ ] RegistrationScreen
    - New child registration
    - Parent setup wizard
  
  - [ ] MessageScreen
    - Message composition UI
    - Recipient selection
    - Send action with encryption

- [ ] **Services** (`src/services/`)
  - [ ] `encryptionService.ts`
    - RSA public key import
    - Message encryption (RSA key wrap → AES-256-GCM)
    - Payload serialization
  
  - [ ] `backgroundService.ts`
    - Background task setup (expo-task-manager)
    - Periodic message polling
    - Notification handling

- [ ] **API Client** (`src/api/`)
  - [ ] HTTP client setup
  - [ ] Mock API responses for development
  - [ ] Message payload formatting

- [ ] **Components** (`src/components/`)
  - [ ] MessageComposer
  - [ ] RecipientPicker
  - [ ] SendButton (with loading state)

- [ ] **Tests** (`src/__tests__/`)
  - [ ] Encryption/decryption round-trip tests
  - [ ] Message validation tests
  - [ ] Screen navigation tests

---

## 📝 Development Flow

1. **Backend first** – Get `/ingest`, `/score`, `/freeze` working with mock data
2. **Parent app** – Connect to backend, display alerts, implement freeze action
3. **Child app** – Message encryption and sending to backend

## 🔗 API Contract

### 1. POST /ingest

**Request**:
```json
{
  "child_id": "string",
  "message": "RSA+AES encrypted payload (base64)",
  "timestamp": "ISO-8601"
}
```

**Response**:
```json
{
  "receipt_id": "string",
  "status": "received"
}
```

### 2. POST /score

**Request**:
```json
{
  "receipt_id": "string",
  "decrypt_key": "base64"
}
```

**Response**:
```json
{
  "message_id": "string",
  "content": "decrypted text",
  "score": 75,
  "risk_level": "high",
  "flags": ["slur", "threat_keyword"]
}
```

### 3. POST /freeze

**Request**:
```json
{
  "child_id": "string",
  "parent_id": "string",
  "reason": "string"
}
```

**Response**:
```json
{
  "status": "frozen",
  "child_id": "string",
  "timestamp": "ISO-8601"
}
```

---

## 🎯 Success Criteria

- [ ] Backend server starts without errors: `npm run dev`
- [ ] All three routes respond to requests (with mock data if needed)
- [ ] Parent & child apps start with Expo: `npm run dev`
- [ ] Navigation between screens works
- [ ] API calls from frontend reach backend (mock mode)
- [ ] Message encryption/decryption round-trip successful
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`

---

## 📅 Next Actions

1. ✅ Confirm this checklist is complete
2. 🚀 Start Phase 1 scaffolding with VS Code AI
3. 📌 Implement items in priority order:
   - Backend routes (1-2 days)
   - Encryption/decryption utilities (1 day)
   - Parent app screens + API integration (2-3 days)
   - Child app screens + encryption (2-3 days)
   - Testing & refinement (1-2 days)

---

**Phase 1 Estimated Duration**: 1-2 weeks (with concurrent development)

**Status**: Ready for Phase 1 scaffolding ✅
