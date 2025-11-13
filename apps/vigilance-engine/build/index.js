"use strict";
/**
 * Vigilance Engine - Main Express Server
 * Backend API for NANNY parental monitoring system
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
// Import routes
const ingest_1 = require("./routes/ingest");
const score_1 = require("./routes/score");
const freeze_1 = require("./routes/freeze");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
// ============ MIDDLEWARE ============
// Body parser middleware
app.use(express_1.default.json({ limit: '10kb' })); // Limit payload size
app.use(express_1.default.urlencoded({ limit: '10kb', extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});
// CORS middleware (allow frontend origins)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});
// ============ ROUTES ============
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
    });
});
// API Routes - mount routers at base paths
app.use('/ingest', ingest_1.router);
app.use('/score', score_1.router);
app.use('/freeze', freeze_1.router);
// ============ ERROR HANDLING ============
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        error: 'Not Found',
        path: req.path,
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`, err);
    res.status(500).json({
        status: 'error',
        error: 'Internal Server Error',
        message: NODE_ENV === 'development' ? err.message : undefined,
    });
});
// ============ SERVER ============
// Start server
if (NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Vigilance Engine running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${NODE_ENV}`);
        console.log(`📊 Available endpoints:`);
        console.log(`   - GET  /health`);
        console.log(`   - POST /ingest`);
        console.log(`   - POST /score`);
        console.log(`   - POST /freeze`);
        console.log(`   - GET  /freeze/:childId`);
        console.log(`   - POST /unfreeze`);
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map