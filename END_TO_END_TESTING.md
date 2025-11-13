# End-to-End Testing Guide - NANNY System

This guide walks through a complete end-to-end (E2E) flow testing the NANNY parental monitoring system with three concurrent applications: the backend Vigilance Engine, the parent monitoring app, and the child messaging app.

## 📋 Prerequisites

- Node.js 18+ installed
- All dependencies installed (`npm install` in each app directory)
- Three terminal windows or tabs ready
- Ports 8080, 3000 available (or adjust EXPO_PUBLIC_API_URL accordingly)

## 🚀 Quick Setup (3-Terminal Workflow)

### Terminal 1: Backend (Vigilance Engine)

```bash
cd apps/vigilance-engine
npm run dev:watch
```

**Expected output:**
```
🚀 Vigilance Engine running on http://localhost:8080
📝 Environment: development
📊 Available endpoints:
   - GET  /health
   - POST /ingest
   - POST /score
   - GET  /freeze/:childId
   - POST /freeze
   - POST /freeze/unfreeze
```

### Terminal 2: Parent App

```bash
cd apps/parent-app
npm run dev
```

**Expected output:**
```
Expo dev server started...
Bundling complete...
App is ready on port 3000
```

Navigate to `http://localhost:3000` in your browser to see the parent dashboard.

### Terminal 3: Child App

```bash
cd apps/child-app
npm run dev
```

**Expected output:**
```
Expo dev server started...
Bundling complete...
App is ready on port 3001 (or another available port)
```

---

## 🧪 End-to-End Test Scenarios

### Scenario 1: Healthy Message Flow (Low Risk)

**Objective:** Send a benign message and verify it's scored as low risk

**Steps:**

1. **Child App - Login & Send Message**
   - Navigate to child app login screen
   - Login with credentials (e.g., `childId: "child-1"`)
   - Go to "Send Message" screen
   - Type a normal message: `"Hey mom, I'm going to the park tomorrow"`
   - Tap "Send"

2. **Backend - Verify Ingest**
   - Check Terminal 1 logs:
   ```
   [2024-11-13T15:30:00.000Z] POST /ingest
   [AUDIT] INGEST - childId: child-1
   ```
   - Message should be stored in memory with a `messageId`

3. **Backend - Verify Scoring**
   - Backend automatically scores the message
   - Check logs for:
   ```
   [SCORE] Message scored: 15 (low), flagged: false
   [AUDIT] SCORE - childId: child-1
   ```
   - Score: **15** (low risk)
   - Risk Level: **low**
   - Flagged: **false**

4. **Parent App - View Dashboard**
   - Navigate to Dashboard screen
   - Statistics should show:
     - Messages Ingested: +1
     - High Risk Alerts: 0 (unchanged)
     - Average Risk Score: ~15
   - Flagged Messages list should remain empty (only high-risk shown)

**Expected Result:** ✅ Message sent, scored, and categorized as safe

---

### Scenario 2: High-Risk Message (Flagged Content)

**Objective:** Send a message with concerning keywords and verify it's flagged

**Steps:**

1. **Child App - Send Risky Message**
   - Type a message with risk keywords: `"I want to skip school and meet that person from online"`
   - Tap "Send"

2. **Backend - Verify Scoring (High Risk)**
   - Check Terminal 1 logs:
   ```
   [SCORE] Message scored: 75 (high), flagged: true
   [AUDIT] SCORE - childId: child-1
   ```
   - Score: **75** (high risk)
   - Flagged: **true**
   - Explanation: Should mention keywords like "skip school", "meet online"

3. **Parent App - View Flagged Message**
   - Navigate to Dashboard
   - Statistics should update:
     - High Risk Alerts: +1
     - Average Risk Score: increased
   - Go to "Flagged Messages" section
   - See the new high-risk message with:
     - Child name: "child-1"
     - Risk level: **HIGH** (red badge)
     - Score: **75**
     - Explanation: Risk keywords detected

4. **Parent App - Freeze Option**
   - Click on the flagged message
   - See "Freeze Account" button
   - Tap to freeze (optional - see Scenario 3)

**Expected Result:** ✅ High-risk message detected, flagged, and shown to parent

---

### Scenario 3: Account Freeze & Unfreeze

**Objective:** Parent freezes a child account and verifies the child can't send messages

**Steps:**

1. **Parent App - Freeze Account**
   - From Dashboard, locate a flagged message
   - Click message → "Freeze Account" button
   - Confirm action (optional modal)
   - Button should show "Unfreeze Account" afterward

2. **Backend - Verify Freeze**
   - Check Terminal 1 logs:
   ```
   [FREEZE] Child child-1 frozen. Reason: Flagged message detected
   [AUDIT] FREEZE - childId: child-1
   ```
   - Freeze state stored in `freezeStore`

3. **Child App - Blocked Status**
   - Child app should auto-check freeze status (GET /freeze/:childId)
   - Login or message screen shows:
     ```
     ⛔ Your account has been frozen by your parent
     Reason: Flagged message detected
     ```
   - "Send Message" button is disabled

4. **Parent App - Unfreeze Account**
   - From Dashboard, click the same flagged message
   - Button now shows "Unfreeze Account"
   - Tap to unfreeze
   - Confirm action

5. **Backend - Verify Unfreeze**
   - Check Terminal 1 logs:
   ```
   [UNFREEZE] Child child-1 unfrozen
   [AUDIT] UNFREEZE - childId: child-1
   ```

6. **Child App - Restored Access**
   - Child app re-checks freeze status
   - Messaging interface becomes available again
   - Can send new messages

**Expected Result:** ✅ Freeze/unfreeze cycle works end-to-end

---

### Scenario 4: Multiple Children (Parallel Monitoring)

**Objective:** Verify parent can monitor multiple children simultaneously

**Steps:**

1. **Start Child App #2** (in another browser/tab)
   - Set `childId: "child-2"` in login
   - Send a message: `"I'm bored in class"`

2. **Backend - Verify Both Children**
   - Check logs show both ingests and scores
   - Each has unique `messageId` and `childId`

3. **Parent App - View All Children**
   - Dashboard should aggregate stats from all children
   - "Child List" should show:
     - child-1: Frozen ⛔
     - child-2: Normal ✅
   - Statistics reflect combined data

**Expected Result:** ✅ Parent can monitor multiple children concurrently

---

## 🔍 Health Checks

### Backend Health

```bash
# In any terminal:
curl http://localhost:8080/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-13T15:35:00.000Z",
  "environment": "development"
}
```

### API Endpoint Verification

**Test Ingest:**
```bash
curl -X POST http://localhost:8080/ingest \
  -H "Content-Type: application/json" \
  -d '{"childId": "test-child", "encryptedPayload": "ZmFrZV9kYXRh"}'
```

**Expected response:**
```json
{
  "status": "success",
  "messageId": "msg_1234567890"
}
```

**Test Score:**
```bash
curl -X POST http://localhost:8080/score \
  -H "Content-Type: application/json" \
  -d '{"childId": "test-child", "encryptedPayload": "ZmFrZV9kYXRh"}'
```

**Expected response:**
```json
{
  "status": "success",
  "score": 15,
  "riskLevel": "low",
  "flagged": false,
  "explanation": "Low risk score...",
  "messageId": "msg_1234567890"
}
```

---

## 📊 Audit Logs

All actions are logged to `apps/vigilance-engine/logs/audit.log`:

**Example audit log entry:**
```
[2024-11-13T15:30:00.000Z] INGEST - childId: child-1, messageId: msg_123, action: ingest
[2024-11-13T15:30:01.000Z] SCORE - childId: child-1, messageId: msg_123, action: score, riskScore: 75
[2024-11-13T15:30:05.000Z] FREEZE - childId: child-1, action: freeze, reason: Flagged message detected
```

---

## 🐛 Troubleshooting

### Port Conflicts

If port 8080 is already in use:

```bash
# Find process using port 8080
lsof -i :8080

# Kill process (macOS/Linux)
kill -9 <PID>

# Or set custom port
cd apps/vigilance-engine
PORT=8081 npm run dev
```

Then update `EXPO_PUBLIC_API_URL`:
```bash
# In parent-app and child-app terminals:
EXPO_PUBLIC_API_URL=http://localhost:8081
```

### Message Not Showing in Parent

1. Verify backend is running and healthy: `curl http://localhost:8080/health`
2. Check parent app console for API errors
3. Verify `EXPO_PUBLIC_API_URL` points to correct backend port
4. Check browser dev tools Network tab for failed API calls

### Child App Doesn't Show Frozen Status

1. Ensure child app is checking `/freeze/:childId` endpoint
2. Verify backend freeze state is persisted in `freezeStore`
3. Check child app console for errors

### Tests Failing

```bash
cd apps/vigilance-engine
npm run build
npm test

# If still failing, clear cache:
npm test -- --clearCache
```

---

## 📈 Performance Notes

### Current Limitations (MVP)

- **In-memory storage:** Data lost on server restart
- **Single server instance:** No clustering/scaling
- **No database:** Mock encryption/decryption (base64)
- **Synchronous scoring:** No async job queue

### Planned Improvements (Phase 2)

- PostgreSQL for persistent storage
- Redis for in-memory cache/session management
- Queue system (Bull/RabbitMQ) for background scoring
- WebSocket for real-time notifications
- Rate limiting and request throttling

---

## ✅ Checklist: End-to-End Testing

- [ ] Backend starts on port 8080 without errors
- [ ] Parent app loads dashboard with API connectivity
- [ ] Child app logs in and initializes encryption
- [ ] Benign message sent and scored as low risk
- [ ] High-risk message detected and flagged
- [ ] Parent sees flagged message in dashboard
- [ ] Parent can freeze account successfully
- [ ] Child sees frozen status and messaging disabled
- [ ] Parent can unfreeze account successfully
- [ ] Child regains messaging access after unfreeze
- [ ] Audit logs record all actions
- [ ] Health check endpoint responds with status "ok"
- [ ] Multiple children can be monitored in parallel
- [ ] Dashboard statistics aggregate correctly

---

## 📚 Next Steps After E2E Testing

1. **Expand frontend screens:**
   - House Rules setup screen
   - Real-time notifications
   - Detailed message history
   - Analytics/insights dashboard

2. **Enhance backend features:**
   - Advanced threat detection (ML-based)
   - Persistent storage (PostgreSQL)
   - Key rotation and refresh tokens
   - Rate limiting and DDoS protection

3. **Production readiness:**
   - Docker containerization
   - CI/CD pipeline refinement
   - Load testing and optimization
   - Security audits and penetration testing

---

**Last Updated:** November 13, 2024
**Status:** Ready for E2E Testing
**Version:** 0.1.0 (MVP)
