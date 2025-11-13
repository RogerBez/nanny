/**
 * POST / (mounted at /ingest)
 * Receive encrypted message payloads from child app
 * Decrypt and store in memory for processing
 */
import type { MessageStore } from '../types/index';
declare const router: import("express-serve-static-core").Router;
declare const messageStore: MessageStore;
export { router, messageStore };
//# sourceMappingURL=ingest.d.ts.map